import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

const db = admin.firestore();

export const calendarFunctions = {
  // Exchange Google OAuth code for tokens
  exchangeGoogleCode: functions.https.onCall(
    async (
      data: {
        code: string;
        staffId: string;
      },
      context
    ) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      try {
        const oauth2Client = new google.auth.OAuth2(
          functions.config().google?.client_id,
          functions.config().google?.client_secret,
          functions.config().google?.redirect_uri
        );

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(data.code);

        if (!tokens.refresh_token) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "No refresh token received"
          );
        }

        // Store refresh token securely (in production, use Secret Manager)
        const tokenData = {
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          userId: context.auth.uid,
        };

        const tokenRef = await db.collection("oauth_tokens").add(tokenData);

        // Update staff document with calendar connection
        await db.collection("staff").doc(data.staffId).update({
          calendarLinked: true,
          googleOAuthRef: tokenRef.id,
          calendarLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info("Google Calendar connected successfully", {
          staffId: data.staffId,
          userId: context.auth.uid,
        });

        return { success: true, tokenRef: tokenRef.id };
      } catch (error) {
        functions.logger.error("Error exchanging Google code", { error, data });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to exchange Google code"
        );
      }
    }
  ),

  // Sync appointment to Google Calendar
  syncToCalendar: functions.https.onCall(
    async (
      data: {
        appointmentId: string;
        action: "create" | "update" | "delete";
      },
      context
    ) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      try {
        const appointmentDoc = await db
          .collection("appointments")
          .doc(data.appointmentId)
          .get();
        if (!appointmentDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "Appointment not found"
          );
        }

        const appointment = appointmentDoc.data();
        if (!appointment) {
          throw new functions.https.HttpsError(
            "not-found",
            "Appointment data not found"
          );
        }

        // Get staff calendar info
        const staffDoc = await db
          .collection("staff")
          .doc(appointment.staffId)
          .get();
        const staff = staffDoc.data();

        if (!staff?.calendarLinked || !staff?.googleOAuthRef) {
          functions.logger.info("Staff calendar not linked, skipping sync", {
            appointmentId: data.appointmentId,
            staffId: appointment.staffId,
          });
          return { success: true, skipped: true };
        }

        // Get OAuth tokens
        const tokenDoc = await db
          .collection("oauth_tokens")
          .doc(staff.googleOAuthRef)
          .get();
        const tokenData = tokenDoc.data();

        if (!tokenData?.refreshToken) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "No valid OAuth tokens found"
          );
        }

        const oauth2Client = new google.auth.OAuth2(
          functions.config().google?.client_id,
          functions.config().google?.client_secret,
          functions.config().google?.redirect_uri
        );

        oauth2Client.setCredentials({
          refresh_token: tokenData.refreshToken,
          access_token: tokenData.accessToken,
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        let result;

        switch (data.action) {
          case "create":
            result = await createCalendarEvent(
              calendar,
              appointment,
              data.appointmentId
            );
            break;
          case "update":
            result = await updateCalendarEvent(
              calendar,
              appointment,
              data.appointmentId
            );
            break;
          case "delete":
            result = await deleteCalendarEvent(calendar, appointment);
            break;
          default:
            throw new functions.https.HttpsError(
              "invalid-argument",
              "Invalid action"
            );
        }

        functions.logger.info("Calendar sync completed", {
          appointmentId: data.appointmentId,
          action: data.action,
          result,
        });

        return { success: true, result };
      } catch (error) {
        functions.logger.error("Error syncing to calendar", { error, data });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to sync to calendar"
        );
      }
    }
  ),

  // Revoke calendar access
  revokeCalendarAccess: functions.https.onCall(
    async (data: { staffId: string }, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      try {
        const staffDoc = await db.collection("staff").doc(data.staffId).get();
        const staff = staffDoc.data();

        if (!staff?.googleOAuthRef) {
          throw new functions.https.HttpsError(
            "not-found",
            "No calendar connection found"
          );
        }

        // Get OAuth tokens
        const tokenDoc = await db
          .collection("oauth_tokens")
          .doc(staff.googleOAuthRef)
          .get();
        const tokenData = tokenDoc.data();

        if (tokenData?.refreshToken) {
          // Revoke the token with Google
          const oauth2Client = new google.auth.OAuth2(
            functions.config().google?.client_id,
            functions.config().google?.client_secret,
            functions.config().google?.redirect_uri
          );

          await oauth2Client.revokeToken(tokenData.refreshToken);
        }

        // Delete token document
        await db.collection("oauth_tokens").doc(staff.googleOAuthRef).delete();

        // Update staff document
        await db.collection("staff").doc(data.staffId).update({
          calendarLinked: false,
          googleOAuthRef: admin.firestore.FieldValue.delete(),
          calendarRevokedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info("Calendar access revoked successfully", {
          staffId: data.staffId,
          userId: context.auth.uid,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error revoking calendar access", {
          error,
          data,
        });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to revoke calendar access"
        );
      }
    }
  ),
};

// Helper functions
async function createCalendarEvent(
  calendar: any,
  appointment: any,
  appointmentId: string
) {
  // Get additional data for the event
  const [clientDoc, serviceDoc, salonDoc] = await Promise.all([
    db.collection("users").doc(appointment.clientId).get(),
    db.collection("services").doc(appointment.serviceId).get(),
    db.collection("salons").doc(appointment.salonId).get(),
  ]);

  const client = clientDoc.data();
  const service = serviceDoc.data();
  const salon = salonDoc.data();

  const event = {
    summary: `${service?.name} - ${client?.name}`,
    description: `
      Cliente: ${client?.name}
      Email: ${client?.email || "N/A"}
      Telefone: ${client?.phone || "N/A"}
      Serviço: ${service?.name}
      Preço: R$ ${service?.price?.toFixed(2)}
      Observações: ${appointment.notes || "Nenhuma"}
    `.trim(),
    start: {
      dateTime: appointment.start.toDate().toISOString(),
      timeZone: salon?.config?.timezone || "America/Sao_Paulo",
    },
    end: {
      dateTime: appointment.end.toDate().toISOString(),
      timeZone: salon?.config?.timezone || "America/Sao_Paulo",
    },
    location: salon?.address,
    attendees: [{ email: client?.email, optional: false }].filter(
      (attendee) => attendee.email
    ),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 60 }, // 1 hour before
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  // Update appointment with Google Event ID
  await db.collection("appointments").doc(appointmentId).update({
    googleEventId: response.data.id,
  });

  return response.data;
}

async function updateCalendarEvent(
  calendar: any,
  appointment: any,
  appointmentId: string
) {
  if (!appointment.googleEventId) {
    // If no Google Event ID, create new event
    return await createCalendarEvent(calendar, appointment, appointmentId);
  }

  // Get additional data for the event
  const [clientDoc, serviceDoc, salonDoc] = await Promise.all([
    db.collection("users").doc(appointment.clientId).get(),
    db.collection("services").doc(appointment.serviceId).get(),
    db.collection("salons").doc(appointment.salonId).get(),
  ]);

  const client = clientDoc.data();
  const service = serviceDoc.data();
  const salon = salonDoc.data();

  const event = {
    summary: `${service?.name} - ${client?.name}`,
    description: `
      Cliente: ${client?.name}
      Email: ${client?.email || "N/A"}
      Telefone: ${client?.phone || "N/A"}
      Serviço: ${service?.name}
      Preço: R$ ${service?.price?.toFixed(2)}
      Status: ${appointment.status}
      Observações: ${appointment.notes || "Nenhuma"}
    `.trim(),
    start: {
      dateTime: appointment.start.toDate().toISOString(),
      timeZone: salon?.config?.timezone || "America/Sao_Paulo",
    },
    end: {
      dateTime: appointment.end.toDate().toISOString(),
      timeZone: salon?.config?.timezone || "America/Sao_Paulo",
    },
    location: salon?.address,
  };

  const response = await calendar.events.update({
    calendarId: "primary",
    eventId: appointment.googleEventId,
    resource: event,
  });

  return response.data;
}

async function deleteCalendarEvent(calendar: any, appointment: any) {
  if (!appointment.googleEventId) {
    return { success: true, skipped: true };
  }

  const response = await calendar.events.delete({
    calendarId: "primary",
    eventId: appointment.googleEventId,
  });

  return response.data;
}

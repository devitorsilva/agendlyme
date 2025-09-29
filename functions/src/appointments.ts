import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface CreateAppointmentData {
  salonId: string;
  staffId: string;
  clientId: string;
  serviceId: string;
  start: admin.firestore.Timestamp;
  end: admin.firestore.Timestamp;
  notes?: string;
  source: "app" | "web" | "walk_in";
}

export const appointmentFunctions = {
  // Callable function to create appointment with conflict checking
  createAppointment: functions.https.onCall(
    async (data: CreateAppointmentData, context) => {
      // Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      const uid = context.auth.uid;

      try {
        // Validate input data
        if (
          !data.salonId ||
          !data.staffId ||
          !data.clientId ||
          !data.serviceId ||
          !data.start ||
          !data.end
        ) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required fields"
          );
        }

        // Verify start < end
        if (data.start.toMillis() >= data.end.toMillis()) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Start time must be before end time"
          );
        }

        // Create appointment in transaction to prevent conflicts
        const appointmentRef = await db.runTransaction(async (transaction) => {
          // Check for conflicts
          const conflictsQuery = db
            .collection("appointments")
            .where("staffId", "==", data.staffId)
            .where("status", "in", ["pending", "confirmed"])
            .where("start", ">=", data.start)
            .where("start", "<", data.end);

          const conflictsSnapshot = await transaction.get(conflictsQuery);

          if (!conflictsSnapshot.empty) {
            throw new functions.https.HttpsError(
              "already-exists",
              "Time slot conflict detected"
            );
          }

          // Create the appointment
          const appointmentRef = db.collection("appointments").doc();
          const appointmentData = {
            ...data,
            status: "pending",
            createdBy: uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          transaction.set(appointmentRef, appointmentData);
          return appointmentRef;
        });

        functions.logger.info("Appointment created successfully", {
          appointmentId: appointmentRef.id,
          salonId: data.salonId,
          staffId: data.staffId,
          clientId: data.clientId,
        });

        return { appointmentId: appointmentRef.id };
      } catch (error) {
        functions.logger.error("Error creating appointment", { error, data });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to create appointment"
        );
      }
    }
  ),

  // Callable function to update appointment
  updateAppointment: functions.https.onCall(
    async (data: { appointmentId: string; updates: any }, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      try {
        const appointmentRef = db
          .collection("appointments")
          .doc(data.appointmentId);
        await appointmentRef.update({
          ...data.updates,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info("Appointment updated successfully", {
          appointmentId: data.appointmentId,
          updates: data.updates,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error updating appointment", { error, data });
        throw new functions.https.HttpsError(
          "internal",
          "Failed to update appointment"
        );
      }
    }
  ),

  // Callable function to cancel appointment
  cancelAppointment: functions.https.onCall(
    async (data: { appointmentId: string; reason?: string }, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      try {
        const appointmentRef = db
          .collection("appointments")
          .doc(data.appointmentId);
        await appointmentRef.update({
          status: "canceled",
          cancelReason: data.reason || "",
          canceledAt: admin.firestore.FieldValue.serverTimestamp(),
          canceledBy: context.auth.uid,
        });

        functions.logger.info("Appointment canceled successfully", {
          appointmentId: data.appointmentId,
          reason: data.reason,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error canceling appointment", { error, data });
        throw new functions.https.HttpsError(
          "internal",
          "Failed to cancel appointment"
        );
      }
    }
  ),

  // Trigger when appointment is created
  onAppointmentCreate: functions.firestore
    .document("appointments/{appointmentId}")
    .onCreate(async (snap, context) => {
      const appointment = snap.data();
      const appointmentId = context.params.appointmentId;

      try {
        functions.logger.info("Appointment created trigger", {
          appointmentId,
          appointment,
        });

        // Schedule reminder emails
        await scheduleReminders(appointmentId, appointment);

        // Sync to Google Calendar if enabled
        await syncAppointmentToCalendar(appointmentId, appointment, "create");

        // Send confirmation email
        await sendConfirmationEmail(appointmentId, appointment);
      } catch (error) {
        functions.logger.error("Error in appointment create trigger", {
          error,
          appointmentId,
        });
      }
    }),

  // Trigger when appointment is updated
  onAppointmentUpdate: functions.firestore
    .document("appointments/{appointmentId}")
    .onUpdate(async (change, context) => {
      const before = change.before.data();
      const after = change.after.data();
      const appointmentId = context.params.appointmentId;

      try {
        functions.logger.info("Appointment updated trigger", {
          appointmentId,
          before,
          after,
        });

        // Sync to Google Calendar if enabled
        await syncAppointmentToCalendar(appointmentId, after, "update");

        // Handle status changes
        if (before.status !== after.status) {
          await handleStatusChange(
            appointmentId,
            before.status,
            after.status,
            after
          );
        }
      } catch (error) {
        functions.logger.error("Error in appointment update trigger", {
          error,
          appointmentId,
        });
      }
    }),

  // Trigger when appointment is deleted
  onAppointmentDelete: functions.firestore
    .document("appointments/{appointmentId}")
    .onDelete(async (snap, context) => {
      const appointment = snap.data();
      const appointmentId = context.params.appointmentId;

      try {
        functions.logger.info("Appointment deleted trigger", {
          appointmentId,
          appointment,
        });

        // Remove from Google Calendar if exists
        if (appointment.googleEventId) {
          await syncAppointmentToCalendar(appointmentId, appointment, "delete");
        }
      } catch (error) {
        functions.logger.error("Error in appointment delete trigger", {
          error,
          appointmentId,
        });
      }
    }),
};

// Helper functions
async function scheduleReminders(appointmentId: string, appointment: any) {
  // This would use Cloud Tasks to schedule reminder emails
  // Implementation would depend on your email service setup
  functions.logger.info("Scheduling reminders", { appointmentId });
}

async function syncAppointmentToCalendar(
  appointmentId: string,
  appointment: any,
  action: "create" | "update" | "delete"
) {
  // This would sync with Google Calendar
  // Implementation in calendar.ts
  functions.logger.info("Syncing to calendar", { appointmentId, action });
}

async function sendConfirmationEmail(appointmentId: string, appointment: any) {
  // This would send confirmation email
  // Implementation in email.ts
  functions.logger.info("Sending confirmation email", { appointmentId });
}

async function handleStatusChange(
  appointmentId: string,
  oldStatus: string,
  newStatus: string,
  appointment: any
) {
  functions.logger.info("Handling status change", {
    appointmentId,
    oldStatus,
    newStatus,
  });

  if (newStatus === "done") {
    // Send review request email after appointment is completed
    functions.logger.info("Appointment completed, scheduling review request", {
      appointmentId,
    });
  }
}

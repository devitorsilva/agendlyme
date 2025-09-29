import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sgMail from '@sendgrid/mail';

const db = admin.firestore();

// Initialize SendGrid (commented out for now)
// sgMail.setApiKey(functions.config().sendgrid?.api_key || '');

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export const emailFunctions = {
  // Send reminder email
  sendReminderEmail: functions.https.onCall(
    async (
      data: {
        appointmentId: string;
        type: "day_before" | "hour_before";
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

        // Get client information
        const clientDoc = await db
          .collection("users")
          .doc(appointment.clientId)
          .get();
        const client = clientDoc.data();

        if (!client?.email) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Client email not found"
          );
        }

        // Get salon information
        const salonDoc = await db
          .collection("salons")
          .doc(appointment.salonId)
          .get();
        const salon = salonDoc.data();

        // Get service information
        const serviceDoc = await db
          .collection("services")
          .doc(appointment.serviceId)
          .get();
        const service = serviceDoc.data();

        const emailTemplate = generateReminderTemplate(data.type, {
          client,
          salon,
          service,
          appointment,
        });

        await sendEmail({
          to: client.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        functions.logger.info("Reminder email sent successfully", {
          appointmentId: data.appointmentId,
          type: data.type,
          clientEmail: client.email,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error sending reminder email", { error, data });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to send reminder email"
        );
      }
    }
  ),

  // Send confirmation email
  sendConfirmationEmail: functions.https.onCall(
    async (data: { appointmentId: string }, context) => {
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

        // Get client information
        const clientDoc = await db
          .collection("users")
          .doc(appointment.clientId)
          .get();
        const client = clientDoc.data();

        if (!client?.email) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Client email not found"
          );
        }

        // Get salon information
        const salonDoc = await db
          .collection("salons")
          .doc(appointment.salonId)
          .get();
        const salon = salonDoc.data();

        // Get service information
        const serviceDoc = await db
          .collection("services")
          .doc(appointment.serviceId)
          .get();
        const service = serviceDoc.data();

        const emailTemplate = generateConfirmationTemplate({
          client,
          salon,
          service,
          appointment,
        });

        await sendEmail({
          to: client.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        functions.logger.info("Confirmation email sent successfully", {
          appointmentId: data.appointmentId,
          clientEmail: client.email,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error sending confirmation email", {
          error,
          data,
        });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to send confirmation email"
        );
      }
    }
  ),

  // Send review request email
  sendReviewRequestEmail: functions.https.onCall(
    async (data: { appointmentId: string }, context) => {
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
        if (!appointment || appointment.status !== "done") {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Appointment must be completed"
          );
        }

        // Get client information
        const clientDoc = await db
          .collection("users")
          .doc(appointment.clientId)
          .get();
        const client = clientDoc.data();

        if (!client?.email) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Client email not found"
          );
        }

        // Get salon information
        const salonDoc = await db
          .collection("salons")
          .doc(appointment.salonId)
          .get();
        const salon = salonDoc.data();

        const emailTemplate = generateReviewRequestTemplate({
          client,
          salon,
          appointment,
        });

        await sendEmail({
          to: client.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        functions.logger.info("Review request email sent successfully", {
          appointmentId: data.appointmentId,
          clientEmail: client.email,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error sending review request email", {
          error,
          data,
        });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to send review request email"
        );
      }
    }
  ),

  // Scheduled function to send reminder emails
  scheduledReminders: functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
      try {
        const now = new Date();
        const dayBefore = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const hourBefore = new Date(now.getTime() + 60 * 60 * 1000);

        // Find appointments for day-before reminders
        const dayBeforeQuery = await db
          .collection("appointments")
          .where("status", "in", ["pending", "confirmed"])
          .where("start", ">=", admin.firestore.Timestamp.fromDate(dayBefore))
          .where(
            "start",
            "<",
            admin.firestore.Timestamp.fromDate(
              new Date(dayBefore.getTime() + 60 * 60 * 1000)
            )
          )
          .get();

        // Find appointments for hour-before reminders
        const hourBeforeQuery = await db
          .collection("appointments")
          .where("status", "in", ["pending", "confirmed"])
          .where("start", ">=", admin.firestore.Timestamp.fromDate(hourBefore))
          .where(
            "start",
            "<",
            admin.firestore.Timestamp.fromDate(
              new Date(hourBefore.getTime() + 60 * 60 * 1000)
            )
          )
          .get();

        const promises: Promise<any>[] = [];

        // Schedule day-before reminders
        dayBeforeQuery.docs.forEach((doc) => {
          promises.push(sendReminderEmailInternal(doc.id, "day_before"));
        });

        // Schedule hour-before reminders
        hourBeforeQuery.docs.forEach((doc) => {
          promises.push(sendReminderEmailInternal(doc.id, "hour_before"));
        });

        await Promise.allSettled(promises);

        functions.logger.info("Scheduled reminders processed", {
          dayBeforeCount: dayBeforeQuery.size,
          hourBeforeCount: hourBeforeQuery.size,
        });
      } catch (error) {
        functions.logger.error("Error in scheduled reminders", { error });
      }
    }),
};

// Helper functions
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // This is a placeholder implementation
  // In production, you would use SendGrid, Resend, or another email service

  functions.logger.info("Email would be sent", {
    to: params.to,
    subject: params.subject,
  });

  // Example SendGrid implementation:
  // const msg = {
  //   to: params.to,
  //   from: functions.config().email?.from_address || 'noreply@agendlyme.com',
  //   subject: params.subject,
  //   html: params.html,
  //   text: params.text,
  // };
  //
  // await sgMail.send(msg);
}

async function sendReminderEmailInternal(
  appointmentId: string,
  type: "day_before" | "hour_before"
) {
  try {
    // This would call the main sendReminderEmail function
    functions.logger.info("Sending internal reminder", { appointmentId, type });
  } catch (error) {
    functions.logger.error("Error sending internal reminder", {
      error,
      appointmentId,
      type,
    });
  }
}

function generateReminderTemplate(
  type: "day_before" | "hour_before",
  data: any
): EmailTemplate {
  const { client, salon, service, appointment } = data;
  const appointmentDate = appointment.start.toDate();

  const timeUntil = type === "day_before" ? "amanhã" : "em 1 hora";

  return {
    subject: `Lembrete: Seu agendamento ${timeUntil} - ${salon?.name}`,
    html: `
      <h2>Lembrete de Agendamento</h2>
      <p>Olá, ${client?.name}!</p>
      <p>Este é um lembrete de que você tem um agendamento ${timeUntil}:</p>
      <ul>
        <li><strong>Salão:</strong> ${salon?.name}</li>
        <li><strong>Serviço:</strong> ${service?.name}</li>
        <li><strong>Data:</strong> ${appointmentDate.toLocaleDateString(
          "pt-BR"
        )}</li>
        <li><strong>Horário:</strong> ${appointmentDate.toLocaleTimeString(
          "pt-BR",
          { hour: "2-digit", minute: "2-digit" }
        )}</li>
        <li><strong>Endereço:</strong> ${salon?.address}</li>
      </ul>
      <p>Nos vemos em breve!</p>
    `,
    text: `Lembrete: Você tem um agendamento ${timeUntil} no ${
      salon?.name
    } para ${service?.name} às ${appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}.`,
  };
}

function generateConfirmationTemplate(data: any): EmailTemplate {
  const { client, salon, service, appointment } = data;
  const appointmentDate = appointment.start.toDate();

  return {
    subject: `Agendamento Confirmado - ${salon?.name}`,
    html: `
      <h2>Agendamento Confirmado!</h2>
      <p>Olá, ${client?.name}!</p>
      <p>Seu agendamento foi confirmado com sucesso:</p>
      <ul>
        <li><strong>Salão:</strong> ${salon?.name}</li>
        <li><strong>Serviço:</strong> ${service?.name}</li>
        <li><strong>Data:</strong> ${appointmentDate.toLocaleDateString(
          "pt-BR"
        )}</li>
        <li><strong>Horário:</strong> ${appointmentDate.toLocaleTimeString(
          "pt-BR",
          { hour: "2-digit", minute: "2-digit" }
        )}</li>
        <li><strong>Endereço:</strong> ${salon?.address}</li>
        <li><strong>Preço:</strong> R$ ${service?.price?.toFixed(2)}</li>
      </ul>
      <p>Aguardamos você!</p>
    `,
    text: `Agendamento confirmado no ${salon?.name} para ${
      service?.name
    } em ${appointmentDate.toLocaleDateString(
      "pt-BR"
    )} às ${appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}.`,
  };
}

function generateReviewRequestTemplate(data: any): EmailTemplate {
  const { client, salon } = data;

  return {
    subject: `Como foi sua experiência no ${salon?.name}?`,
    html: `
      <h2>Avalie sua experiência!</h2>
      <p>Olá, ${client?.name}!</p>
      <p>Esperamos que tenha gostado do atendimento no ${salon?.name}.</p>
      <p>Sua opinião é muito importante para nós. Que tal deixar uma avaliação?</p>
      <p>Obrigado por escolher nossos serviços!</p>
    `,
    text: `Como foi sua experiência no ${salon?.name}? Deixe sua avaliação!`,
  };
}

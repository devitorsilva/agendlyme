import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { appointmentFunctions } from "./appointments";
import { authFunctions } from "./auth";
import { emailFunctions } from "./email";
import { calendarFunctions } from "./calendar";

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export const {
  createAppointment,
  updateAppointment,
  cancelAppointment,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
} = appointmentFunctions;

export const { setCustomClaims, onUserCreate } = authFunctions;

export const {
  sendReminderEmail,
  sendConfirmationEmail,
  sendReviewRequestEmail,
} = emailFunctions;

export const { exchangeGoogleCode, syncToCalendar, revokeCalendarAccess } =
  calendarFunctions;

// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

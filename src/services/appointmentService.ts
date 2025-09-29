import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";
import { Appointment } from "../types";

export class AppointmentService {
  static async createAppointment(
    appointmentData: Omit<Appointment, "id" | "createdAt">
  ): Promise<string> {
    const createAppointmentFn = httpsCallable<
      Record<string, unknown>,
      { appointmentId: string }
    >(functions, "createAppointment");

    try {
      const payload: Record<string, unknown> = {
        ...appointmentData,
        start: Timestamp.fromDate(appointmentData.start),
        end: Timestamp.fromDate(appointmentData.end),
      };

      const result = await createAppointmentFn(payload);
      const data = result.data;

      if (!data?.appointmentId) {
        throw new Error("Resposta invalida do servidor ao criar agendamento.");
      }

      return data.appointmentId;
    } catch (error) {
      const functionsError = error as { code?: string; message?: string };

      if (functionsError.code === "functions/already-exists") {
        throw new Error("Conflito de horario detectado");
      }

      throw error;
    }
  }

  static async getAppointment(
    appointmentId: string
  ): Promise<Appointment | null> {
    const docRef = doc(db, "appointments", appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }

    return null;
  }

  static async getAppointmentsBySalon(salonId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, "appointments"),
      where("salonId", "==", salonId),
      orderBy("start", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() } as Appointment)
    );
  }

  static async getAppointmentsByStaff(staffId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, "appointments"),
      where("staffId", "==", staffId),
      orderBy("start", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() } as Appointment)
    );
  }

  static async getAppointmentsByClient(
    clientId: string
  ): Promise<Appointment[]> {
    const q = query(
      collection(db, "appointments"),
      where("clientId", "==", clientId),
      orderBy("start", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() } as Appointment)
    );
  }

  static async updateAppointment(
    appointmentId: string,
    updates: Partial<Appointment>
  ): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, updates);
  }

  static async cancelAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, { status: "canceled" });
  }

  static async confirmAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, { status: "confirmed" });
  }

  static async completeAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, { status: "done" });
  }

  static async markNoShow(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, { status: "no_show" });
  }

  static async deleteAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await deleteDoc(docRef);
  }
}

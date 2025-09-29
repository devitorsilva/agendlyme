import { create } from "zustand";
import { Appointment } from "../types";

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  setAppointments: (appointments: Appointment[]) => void;
  setLoading: (loading: boolean) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => void;
  deleteAppointment: (appointmentId: string) => void;
  getAppointmentsByStaff: (staffId: string) => Appointment[];
  getAppointmentsByDate: (date: Date) => Appointment[];
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,
  setAppointments: (appointments) => set({ appointments }),
  setLoading: (loading) => set({ isLoading: loading }),
  addAppointment: (appointment) =>
    set((state) => ({ appointments: [...state.appointments, appointment] })),
  updateAppointment: (appointmentId, updates) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, ...updates }
          : appointment
      ),
    })),
  deleteAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.filter(
        (appointment) => appointment.id !== appointmentId
      ),
    })),
  getAppointmentsByStaff: (staffId) =>
    get().appointments.filter((appointment) => appointment.staffId === staffId),
  getAppointmentsByDate: (date) =>
    get().appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start);
      return appointmentDate.toDateString() === date.toDateString();
    }),
}));

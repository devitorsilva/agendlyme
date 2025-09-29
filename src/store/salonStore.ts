import { create } from "zustand";
import { Salon, Service, Staff } from "../types";

interface SalonState {
  currentSalon: Salon | null;
  services: Service[];
  staff: Staff[];
  isLoading: boolean;
  setCurrentSalon: (salon: Salon | null) => void;
  setServices: (services: Service[]) => void;
  setStaff: (staff: Staff[]) => void;
  setLoading: (loading: boolean) => void;
  addService: (service: Service) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (staffId: string, updates: Partial<Staff>) => void;
  deleteStaff: (staffId: string) => void;
}

export const useSalonStore = create<SalonState>((set) => ({
  currentSalon: null,
  services: [],
  staff: [],
  isLoading: false,
  setCurrentSalon: (salon) => set({ currentSalon: salon }),
  setServices: (services) => set({ services }),
  setStaff: (staff) => set({ staff }),
  setLoading: (loading) => set({ isLoading: loading }),
  addService: (service) =>
    set((state) => ({ services: [...state.services, service] })),
  updateService: (serviceId, updates) =>
    set((state) => ({
      services: state.services.map((service) =>
        service.id === serviceId ? { ...service, ...updates } : service
      ),
    })),
  deleteService: (serviceId) =>
    set((state) => ({
      services: state.services.filter((service) => service.id !== serviceId),
    })),
  addStaff: (staff) => set((state) => ({ staff: [...state.staff, staff] })),
  updateStaff: (staffId, updates) =>
    set((state) => ({
      staff: state.staff.map((staff) =>
        staff.id === staffId ? { ...staff, ...updates } : staff
      ),
    })),
  deleteStaff: (staffId) =>
    set((state) => ({
      staff: state.staff.filter((staff) => staff.id !== staffId),
    })),
}));

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  roles: string[];
  salonIds: string[];
  createdAt: Date;
  pushToken?: string;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  config: {
    workingHours: {
      start: string;
      end: string;
    };
    holidays: string[];
    timezone: string;
  };
  createdAt: Date;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  durationMin: number;
  price: number;
  category: string;
  isActive: boolean;
}

export interface Staff {
  id: string;
  userId: string;
  salonId: string;
  servicesOffered: string[];
  calendarLinked: boolean;
  googleOAuthRef?: string;
  workHours: {
    dayOfWeek: number;
    start: string;
    end: string;
  }[];
  breaks: {
    start: string;
    end: string;
  }[];
}

export interface Appointment {
  id: string;
  salonId: string;
  staffId: string;
  clientId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: "pending" | "confirmed" | "done" | "no_show" | "canceled";
  notes?: string;
  source: "app" | "web" | "walk_in";
  createdBy: string;
  createdAt: Date;
  googleEventId?: string;
}

export interface Review {
  id: string;
  salonId: string;
  appointmentId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface CashRegister {
  id: string;
  salonId: string;
  date: string;
  entries: {
    value: number;
    method: string;
    ref: string;
  }[];
  exits: {
    value: number;
    method: string;
    ref: string;
  }[];
  openingBalance: number;
  closingBalance: number;
  notes?: string;
}

export interface Promotion {
  id: string;
  salonId: string;
  title: string;
  rule: string;
  period: {
    start: Date;
    end: Date;
  };
  isActive: boolean;
}

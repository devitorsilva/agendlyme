import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Salon, Service, Staff } from "../types";

export class SalonService {
  static async createSalon(
    salonData: Omit<Salon, "id" | "createdAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "salons"), {
      ...salonData,
      createdAt: new Date(),
    });
    return docRef.id;
  }

  static async getSalon(salonId: string): Promise<Salon | null> {
    const docRef = doc(db, "salons", salonId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Salon;
    }

    return null;
  }

  static async getSalonsByOwner(ownerId: string): Promise<Salon[]> {
    const q = query(
      collection(db, "salons"),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Salon)
    );
  }

  static async updateSalon(
    salonId: string,
    updates: Partial<Salon>
  ): Promise<void> {
    const docRef = doc(db, "salons", salonId);
    await updateDoc(docRef, updates);
  }

  static async deleteSalon(salonId: string): Promise<void> {
    const docRef = doc(db, "salons", salonId);
    await deleteDoc(docRef);
  }

  static async createService(
    serviceData: Omit<Service, "id">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "services"), serviceData);
    return docRef.id;
  }

  static async getServicesBySalon(salonId: string): Promise<Service[]> {
    const q = query(
      collection(db, "services"),
      where("salonId", "==", salonId),
      where("isActive", "==", true),
      orderBy("name")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Service)
    );
  }

  static async updateService(
    serviceId: string,
    updates: Partial<Service>
  ): Promise<void> {
    const docRef = doc(db, "services", serviceId);
    await updateDoc(docRef, updates);
  }

  static async deleteService(serviceId: string): Promise<void> {
    const docRef = doc(db, "services", serviceId);
    await updateDoc(docRef, { isActive: false });
  }

  static async createStaff(staffData: Omit<Staff, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "staff"), staffData);
    return docRef.id;
  }

  static async getStaffBySalon(salonId: string): Promise<Staff[]> {
    const q = query(
      collection(db, "staff"),
      where("salonId", "==", salonId),
      orderBy("userId")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Staff)
    );
  }

  static async updateStaff(
    staffId: string,
    updates: Partial<Staff>
  ): Promise<void> {
    const docRef = doc(db, "staff", staffId);
    await updateDoc(docRef, updates);
  }

  static async deleteStaff(staffId: string): Promise<void> {
    const docRef = doc(db, "staff", staffId);
    await deleteDoc(docRef);
  }
}

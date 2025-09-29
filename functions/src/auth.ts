import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const authFunctions = {
  // Set custom claims for user roles and salon access
  setCustomClaims: functions.https.onCall(
    async (data: { uid: string; claims: any }, context) => {
      // Verify authentication and authorization
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      // Only allow salon owners or admins to set claims
      const callerClaims = context.auth.token;
      if (
        !callerClaims.roles?.includes("owner") &&
        !callerClaims.roles?.includes("admin")
      ) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Insufficient permissions"
        );
      }

      try {
        await admin.auth().setCustomUserClaims(data.uid, data.claims);

        functions.logger.info("Custom claims set successfully", {
          targetUid: data.uid,
          claims: data.claims,
          setBy: context.auth.uid,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error setting custom claims", { error, data });
        throw new functions.https.HttpsError(
          "internal",
          "Failed to set custom claims"
        );
      }
    }
  ),

  // Trigger when a new user is created
  onUserCreate: functions.auth.user().onCreate(async (user) => {
    try {
      // Create user document in Firestore
      const userData = {
        id: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        photoUrl: user.photoURL || "",
        roles: ["client"], // Default role
        salonIds: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("users").doc(user.uid).set(userData);

      // Set default custom claims
      await admin.auth().setCustomUserClaims(user.uid, {
        roles: ["client"],
        salonIds: [],
      });

      functions.logger.info("User created successfully", {
        uid: user.uid,
        email: user.email,
      });
    } catch (error) {
      functions.logger.error("Error in user creation trigger", {
        error,
        uid: user.uid,
        email: user.email,
      });
    }
  }),

  // Function to add user to salon (owner or staff)
  addUserToSalon: functions.https.onCall(
    async (
      data: {
        userId: string;
        salonId: string;
        role: "owner" | "staff";
        servicesOffered?: string[];
        workHours?: any[];
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
        // Verify caller is owner of the salon
        const salonDoc = await db.collection("salons").doc(data.salonId).get();
        if (!salonDoc.exists) {
          throw new functions.https.HttpsError("not-found", "Salon not found");
        }

        const salonData = salonDoc.data();
        if (salonData?.ownerId !== context.auth.uid) {
          throw new functions.https.HttpsError(
            "permission-denied",
            "Only salon owner can add users"
          );
        }

        // Get current user claims
        const targetUser = await admin.auth().getUser(data.userId);
        const currentClaims = targetUser.customClaims || {};
        const currentRoles = currentClaims.roles || ["client"];
        const currentSalonIds = currentClaims.salonIds || [];

        // Update roles and salon access
        const newRoles = [...new Set([...currentRoles, data.role])];
        const newSalonIds = [...new Set([...currentSalonIds, data.salonId])];

        await admin.auth().setCustomUserClaims(data.userId, {
          ...currentClaims,
          roles: newRoles,
          salonIds: newSalonIds,
        });

        // If adding as staff, create staff document
        if (data.role === "staff") {
          const staffData = {
            userId: data.userId,
            salonId: data.salonId,
            servicesOffered: data.servicesOffered || [],
            calendarLinked: false,
            workHours: data.workHours || [],
            breaks: [],
          };

          await db.collection("staff").add(staffData);
        }

        functions.logger.info("User added to salon successfully", {
          userId: data.userId,
          salonId: data.salonId,
          role: data.role,
          addedBy: context.auth.uid,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error adding user to salon", { error, data });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to add user to salon"
        );
      }
    }
  ),

  // Function to remove user from salon
  removeUserFromSalon: functions.https.onCall(
    async (
      data: {
        userId: string;
        salonId: string;
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
        // Verify caller is owner of the salon
        const salonDoc = await db.collection("salons").doc(data.salonId).get();
        if (!salonDoc.exists) {
          throw new functions.https.HttpsError("not-found", "Salon not found");
        }

        const salonData = salonDoc.data();
        if (salonData?.ownerId !== context.auth.uid) {
          throw new functions.https.HttpsError(
            "permission-denied",
            "Only salon owner can remove users"
          );
        }

        // Get current user claims
        const targetUser = await admin.auth().getUser(data.userId);
        const currentClaims = targetUser.customClaims || {};
        const currentSalonIds = currentClaims.salonIds || [];

        // Remove salon from user's access
        const newSalonIds = currentSalonIds.filter(
          (id: string) => id !== data.salonId
        );

        await admin.auth().setCustomUserClaims(data.userId, {
          ...currentClaims,
          salonIds: newSalonIds,
        });

        // Remove staff document if exists
        const staffQuery = await db
          .collection("staff")
          .where("userId", "==", data.userId)
          .where("salonId", "==", data.salonId)
          .get();

        const batch = db.batch();
        staffQuery.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        functions.logger.info("User removed from salon successfully", {
          userId: data.userId,
          salonId: data.salonId,
          removedBy: context.auth.uid,
        });

        return { success: true };
      } catch (error) {
        functions.logger.error("Error removing user from salon", {
          error,
          data,
        });

        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          "internal",
          "Failed to remove user from salon"
        );
      }
    }
  ),
};

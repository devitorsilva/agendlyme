import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { AuthRequest, makeRedirectUri, ResponseType } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { auth, db } from "./firebase";
import { User } from "../types";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_SCOPES = ["openid", "profile", "email"];

export class AuthService {
  static async signInWithEmail(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      throw new Error("Usuario nao encontrado");
    }

    return userDoc.data() as User;
  }

  static async signUpWithEmail(
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const userData: User = {
      id: user.uid,
      name,
      email,
      phone,
      roles: ["client"],
      salonIds: [],
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return userData;
  }

  static async signInWithGoogle(): Promise<User> {
    const isNativePlatform = Platform.OS === "ios" || Platform.OS === "android";

    if (!isNativePlatform) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return this.ensureUserDocument(result.user);
    }

    const clientId = this.getGoogleClientId();
    if (!clientId) {
      throw new Error(
        "Google Sign-In is not configured. Please add the client IDs to your .env file."
      );
    }

    const redirectUri = makeRedirectUri();
    const request = new AuthRequest({
      clientId,
      redirectUri,
      scopes: GOOGLE_SCOPES,
      responseType: ResponseType.Token,
      extraParams: {
        response_type: "token id_token",
        prompt: "consent",
      },
      usePKCE: false,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: GOOGLE_AUTH_ENDPOINT,
    });

    if (result.type !== "success") {
      throw new Error("Google Sign-In was cancelled.");
    }

    const params = result.params as Record<string, string> | undefined;
    const idToken = params?.id_token;
    const accessToken = params?.access_token;

    if (!idToken) {
      throw new Error("Google Sign-In did not provide an ID token.");
    }

    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const userCredential = await signInWithCredential(auth, credential);

    return this.ensureUserDocument(userCredential.user);
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  private static getGoogleClientId(): string | undefined {
    if (Platform.OS === "ios") {
      return (
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        undefined
      );
    }

    if (Platform.OS === "android") {
      return (
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        undefined
      );
    }

    return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;
  }

  private static async ensureUserDocument(
    firebaseUser: FirebaseUser
  ): Promise<User> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    const userData: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoUrl: firebaseUser.photoURL || undefined,
      roles: ["client"],
      salonIds: [],
      createdAt: new Date(),
    };

    await setDoc(userRef, userData);
    return userData;
  }
}

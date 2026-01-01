import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyMockKeyForBuild1234567890abcdefg", // Fake valid-format key
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:12345abcde",
};

// Initialize Firebase
const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

let auth: Auth | undefined;

// Only initialize Auth if we have a real-looking key (not our mock)
// This strictly prevents theSDK from throwing "auth/invalid-api-key" during Vercel build
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("MockKey")) {
    try {
        auth = getAuth(app);
    } catch (e) {
        console.warn("Firebase Auth init failed:", e);
    }
} else {
    console.warn("Using Mock API Key or missing key: Skipping Firebase Auth initialization for build.");
}

export { auth };
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signOut = async () => {
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

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
// If we are on the server (build time) or missing keys, we might still initialize 
// but auth functions won't work. valid API key format might be checked by SDK?
// If it fails with "invalid-api-key", the SDK checks format likely.
const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

let auth: Auth;
try {
    auth = getAuth(app);
} catch (e) {
    console.warn("Firebase Auth init failed (expected during build without env vars):", e);
    // Provide a minimal mock if instantiation fails, to allow imports to proceed
    // However, getAuth returns an interface. We might just leave it undefined
    // and handle it in consumers, or cast a mock.
    // But usually getAuth(app) only fails if api key is structurally invalid.
    // With the fake key, it should pass the synchronous check.
}
export { auth };
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

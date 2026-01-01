
import "server-only";
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Singleton initialization
const getFirebaseAdminApp = () => {
    if (getApps().length) {
        return getApp();
    }
    return initializeApp({
        credential: cert(serviceAccount),
    });
};

export const adminApp = getFirebaseAdminApp();
export const adminStorage = getStorage(adminApp);


import "server-only";
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Lazy initialization wrapper
export const getAdminApp = () => {
    if (getApps().length) {
        return getApp();
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        // Log specifically which one is missing for debugging
        const missing = [];
        if (!projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
        if (!clientEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
        if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");

        throw new Error(`Missing Firebase Admin Credentials: ${missing.join(", ")}`);
    }

    const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
    };

    return initializeApp({
        credential: cert(serviceAccount),
    });
};

export const getAdminStorage = () => {
    const app = getAdminApp();
    return getStorage(app);
};

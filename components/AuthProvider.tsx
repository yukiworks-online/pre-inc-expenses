"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth not initialized. Check NEXT_PUBLIC_FIREBASE_API_KEY.");
            if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
                alert("システムエラー: 認証機能が初期化されていません。\n管理者にお問い合わせください。(API Key Missing)");
            }
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            // Error is handled in lib/firebase.ts or UI
        }
    };

    const handleSignOut = async () => {
        await signOut();
        // Force full page reload to clear any residual state
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn: handleSignIn, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}

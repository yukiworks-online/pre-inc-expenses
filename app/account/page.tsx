'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Ensure this export exists
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user, loading, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.currentUser) return;

        setIsSaving(true);
        setMessage(null);

        try {
            await updateProfile(auth.currentUser, {
                displayName: displayName
            });

            setMessage({ type: 'success', text: 'プロフィールを更新しました。' });
            // Force a refresh or re-render might be needed to reflect in Header, 
            // but AuthProvider usually listens to changes. 
            // However, updateProfile doesn't always trigger onAuthStateChanged immediately for the same user object reference.
            // A reload ensures consistency across the app.
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '更新に失敗しました。' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 pt-20 font-sans text-slate-200">
            <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-[#0F1115]">
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-accent-primary rounded-full" />
                    アカウント設定
                </h1>

                <p className="text-slate-400 mb-8 text-sm">
                    精算書や経費レポートに表示される氏名を設定します。<br />
                    正式な書類として使用するため、本名での登録を推奨します。
                </p>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium ml-1">表示名 (本名)</label>
                        <input
                            type="text"
                            required
                            placeholder="例: 山田 太郎"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 w-full"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium ml-1">メールアドレス</label>
                        <input
                            type="email"
                            disabled
                            className="bg-white/5 border border-white/5 rounded-lg px-4 py-3 text-slate-500 w-full cursor-not-allowed"
                            value={user.email || ''}
                        />
                        <p className="text-xs text-slate-600 ml-1">※メールアドレスは変更できません</p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-ghost"
                            disabled={isSaving}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn btn-primary px-8"
                        >
                            {isSaving ? '保存中...' : '設定を保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

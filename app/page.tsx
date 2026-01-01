'use client';

import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function Home() {
    const { user, signIn, loading } = useAuth();

    return (
        <div className="container mx-auto px-4 py-20 animate-fade-in font-sans text-slate-200">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto mb-20">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                    Smart Expense <br />
                    Management
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                    AIを活用した次世代の創業準備・経費精算プラットフォーム。<br />
                    レシートをスキャンするだけで、面倒な入力作業から解放されます。
                </p>
                {!user && !loading && (
                    <button
                        onClick={() => signIn()}
                        className="btn btn-primary text-lg px-8 py-4 h-auto"
                    >
                        Googleで始める
                    </button>
                )}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Expense Registration Card */}
                <div className="glass-panel p-8 flex flex-col items-start justify-between text-left space-y-6 hover:border-accent-primary/50 transition duration-300 group bg-[#0F1115]/50 hover:bg-[#0F1115]/80 relative overflow-hidden h-full">
                    {/* ... (keep icon and text) ... */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors border border-indigo-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                    </div>

                    <div className="flex-1 relative z-10">
                        <h2 className="text-xl font-bold text-white mb-3">経費登録</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            レシートをアップロードするだけで、AIが日付・金額・内容を自動解析。<br />
                            入力の手間を最小限に抑えます。
                        </p>
                    </div>

                    {user ? (
                        <Link
                            href="/expenses/new"
                            className="btn btn-primary w-full relative z-50"
                        >
                            経費を追加
                        </Link>
                    ) : (
                        <button disabled className="btn btn-secondary w-full opacity-50 cursor-not-allowed">
                            ログインが必要
                        </button>
                    )}
                </div>

                {/* Settlement/Report Card */}
                <div className="glass-panel p-8 flex flex-col items-start justify-between text-left space-y-6 hover:border-cyan-500/50 transition duration-300 group bg-[#0F1115]/50 hover:bg-[#0F1115]/80 relative overflow-hidden h-full">
                    {/* ... (keep icon and text) ... */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-colors border border-cyan-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                    </div>

                    <div className="flex-1 relative z-10">
                        <h2 className="text-xl font-bold text-white mb-3">精算・レポート</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            未精算の経費データを集計し、ワンクリックで精算書(PDF)を作成。<br />
                            経理処理をスムーズにします。
                        </p>
                    </div>

                    {user ? (
                        <Link
                            href="/settlements"
                            className="btn btn-secondary w-full relative z-50 hover:bg-white/20"
                        >
                            精算画面へ
                        </Link>
                    ) : (
                        <button disabled className="btn btn-secondary w-full opacity-50 cursor-not-allowed">
                            ログインが必要
                        </button>
                    )}
                </div>
            </div>


            <div className="mt-16 max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-slate-500 rounded-full" />
                    最近のアクティビティ
                </h3>
                <div className="glass-panel p-8 bg-[#0F1115] border border-white/5 text-center">
                    {user ? (
                        <div className="space-y-4">
                            <p className="text-slate-400">
                                経費データは Google Sheets に安全に保存されています。
                            </p>
                            <Link href="/expenses" className="text-accent-primary hover:underline text-sm">
                                全ての履歴を確認する &rarr;
                            </Link>
                        </div>
                    ) : (
                        <p className="text-slate-500 italic">
                            ログインすると、ここに履歴が表示されます
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

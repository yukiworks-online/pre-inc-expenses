'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

export function Header() {
    const { user, signIn, signOut } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { name: 'ホーム', href: '/' },
        { name: '経費登録', href: '/expenses/new' },
        { name: '精算処理', href: '/settlements' },
        { name: '履歴一覧', href: '/expenses' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0c10]/80 backdrop-blur-md print:hidden">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                        P
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white group-hover:text-slate-200 transition-colors">
                        Pre-Inc Exp.
                    </span>
                </Link>

                {/* Navigation (Desktop) */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "text-white bg-white/10 shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/account" className="text-sm font-medium text-white/80 hover:text-white transition-colors hidden sm:inline-block">
                                {user.displayName}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="btn btn-secondary py-1 px-3 text-xs h-8"
                            >
                                ログアウト
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="btn btn-primary py-2 px-4 shadow-lg shadow-white/5"
                        >
                            ログイン
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

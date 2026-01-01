import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
    title: '創業前経費管理 | Pre-Inc Expenses',
    description: 'Premium Expense Management for Founders',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Header />
                    <main className="min-h-[calc(100vh-64px)] relative">
                        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}

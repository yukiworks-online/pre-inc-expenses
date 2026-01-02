import { getExpenses } from '@/app/actions';
import { UnsettledExpenseList } from './UnsettledExpenseList';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SettlementsPage() {
    const { success, data: expenses, error } = await getExpenses();

    if (!success || !expenses) {
        return <div className="p-8 text-center text-red-400">Error: {error}</div>;
    }

    // Filter UNSETTLED expenses
    const unsettledExpenses = expenses.filter(e => e.status !== 'SETTLED');
    const totalUnsettled = unsettledExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans text-slate-200">
            <header className="border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    精算処理
                </h1>
                <p className="text-slate-400">未精算の経費をまとめて精算書を作成します</p>
            </header>

            {/* Stats Header is less useful now since selection drives the total, 
                but we can keep a global "Unsettled Total" overview if desired.
                However, for cleaner UI with the new selector, let's simplify.
            */}

            {/* Main Interactive List */}
            <div className="space-y-4">
                <UnsettledExpenseList expenses={unsettledExpenses} />
            </div>
        </div>
    );
}


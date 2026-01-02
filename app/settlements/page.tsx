
import { getExpenses } from '@/app/actions';
import { SettlementButton } from './SettlementButton';
import { DeleteExpenseButton } from './DeleteExpenseButton';
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

            {/* Stats */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#0F1115] flex justify-between items-center">
                <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">未精算総額</h3>
                    <p className="text-4xl font-bold text-accent-primary font-mono">
                        ¥{totalUnsettled.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">対象件数: {unsettledExpenses.length}件</p>
                </div>
                <SettlementButton expenseIds={unsettledExpenses.map(e => e.id as string).filter(Boolean)} />
            </div>

            {/* Unsettled List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">精算対象の経費</h2>
                {unsettledExpenses.length === 0 ? (
                    <div className="glass-panel p-12 text-center text-slate-500 rounded-xl bg-white/5">
                        未精算の経費はありません。全て精算済みです🎉
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {unsettledExpenses.map((expense, i) => (
                            <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">
                                        🧾
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{expense.vendor}</p>
                                        <p className="text-xs text-slate-400 font-mono">{expense.date} • {expense.category}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-bold text-white font-mono">¥{expense.amount.toLocaleString()}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-emerald-400">未精算</p>
                                        <DeleteExpenseButton expenseId={expense.id as string} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


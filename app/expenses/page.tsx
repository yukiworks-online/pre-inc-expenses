import { getExpenses } from '@/app/actions';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';
import { ExpenseRowActions } from './ExpenseRowActions';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const { success, data: expenses, error } = await getExpenses();

    if (!success || !expenses) {
        return (
            <div className="p-8 text-center text-red-400">
                Error loading expenses: {error}
            </div>
        );
    }

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <AuthGuard>
            <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans text-slate-200">
                <header className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            経費一覧
                        </h1>
                        <p className="text-slate-400">登録済みの経費データ (Real-time from Google Sheets)</p>
                    </div>
                    <Link
                        href="/expenses/new"
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium shadow-lg hover:shadow-accent-primary/25 hover:brightness-110 active:scale-95 transition-all"
                    >
                        + 新規登録
                    </Link>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0F1115]">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">総経費額</h3>
                        <p className="text-3xl font-bold text-white font-mono">
                            ¥{totalAmount.toLocaleString()}
                        </p>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0F1115]">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">登録件数</h3>
                        <p className="text-3xl font-bold text-white font-mono">
                            {expenses.length} <span className="text-sm font-normal text-slate-500">件</span>
                        </p>
                    </div>
                </div>

                {/* Expenses Table */}
                <section className="glass-panel rounded-2xl border border-white/5 bg-[#0F1115] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-medium">日付</th>
                                    <th className="px-6 py-4 font-medium">カテゴリー</th>
                                    <th className="px-6 py-4 font-medium">支払先 / 摘要</th>
                                    <th className="px-6 py-4 font-medium text-right">金額</th>
                                    <th className="px-6 py-4 font-medium">立替者</th>
                                    <th className="px-6 py-4 font-medium text-center">証憑</th>
                                    <th className="px-6 py-4 font-medium text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            データがありません
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((expense, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                                                {expense.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/5">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{expense.vendor}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]" title={expense.description}>
                                                    {expense.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-white font-medium">
                                                ¥{expense.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {expense.payer}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {expense.receiptUrl ? (
                                                    <a
                                                        href={expense.receiptUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                                                        title="レシートを表示"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-700">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <ExpenseRowActions
                                                    expenseId={expense.id!}
                                                    status={expense.status || 'UNSETTLED'}
                                                    settlementId={expense.settlementId}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthGuard>
    );
}


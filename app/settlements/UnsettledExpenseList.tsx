'use client';

import { useState, useEffect } from 'react';
import { deleteExpenses } from '@/app/actions';
import { SettlementButton } from './SettlementButton';
import { useRouter } from 'next/navigation';
import { type Expense } from '@/app/actions';
import { useAuth } from '@/components/AuthProvider';

export function UnsettledExpenseList({ expenses }: { expenses: Expense[] }) {
    const { user, loading } = useAuth();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading auth...</div>;
    if (!user) return null; // Will redirect via useEffect

    // Toggle single selection
    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // Toggle all
    const toggleAll = () => {
        if (selectedIds.length === expenses.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(expenses.map(e => e.id as string));
        }
    };

    // Bulk Delete Action
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`選択した ${selectedIds.length} 件の経費を削除しますか？\nこの操作は取り消せません。`)) return;

        setIsDeleting(true);
        try {
            const result = await deleteExpenses(selectedIds);
            if (result.success) {
                setSelectedIds([]);
                router.refresh();
            } else {
                alert('削除に失敗しました: ' + result.error);
            }
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        } finally {
            setIsDeleting(false);
        }
    };

    const totalSelectedAmount = expenses
        .filter(e => selectedIds.includes(e.id as string))
        .reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-accent-primary focus:ring-accent-primary"
                            checked={expenses.length > 0 && selectedIds.length === expenses.length}
                            onChange={toggleAll}
                        />
                        <span>すべて選択 ({expenses.length})</span>
                    </label>
                    <span className="text-slate-500 text-sm">|</span>
                    <span className="text-sm font-mono text-white">
                        選択中: <span className="text-accent-primary font-bold">{selectedIds.length}</span> 件
                        (¥{totalSelectedAmount.toLocaleString()})
                    </span>
                </div>

                <div className="flex gap-3">
                    {/* Delete Button (Only visible when items selected) */}
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all font-medium text-sm animate-in fade-in"
                        >
                            {isDeleting ? '削除中...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    削除
                                </>
                            )}
                        </button>
                    )}

                    {/* Settlement Button (Delegate execution to existing component logic or just wrap it) 
                        The existing SettlementButton takes expenseIds directly.
                        We can control it here.
                    */}
                    <div className={selectedIds.length === 0 ? "opacity-50 pointer-events-none" : ""}>
                        <SettlementButton expenseIds={selectedIds} />
                    </div>
                </div>
            </div>

            {/* List */}
            {expenses.length === 0 ? (
                <div className="glass-panel p-12 text-center text-slate-500 rounded-xl bg-white/5">
                    未精算の経費はありません。全て精算済みです🎉
                </div>
            ) : (
                <div className="grid gap-3">
                    {expenses.map((expense) => {
                        const isSelected = selectedIds.includes(expense.id as string);
                        return (
                            <div
                                key={expense.id}
                                className={`glass-panel p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${isSelected
                                    ? 'bg-accent-primary/10 border-accent-primary/50'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                                onClick={() => toggleSelect(expense.id as string)}
                            >
                                <div className="flex gap-4 items-center">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-accent-primary focus:ring-accent-primary cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(expense.id as string)}
                                        />
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">
                                        🧾
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{expense.vendor}</p>
                                        <p className="text-xs text-slate-400 font-mono">{expense.date} • {expense.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white font-mono">¥{expense.amount.toLocaleString()}</p>
                                    <p className={`text-xs ${isSelected ? 'text-accent-primary' : 'text-emerald-400'}`}>
                                        {isSelected ? '✓ 対象' : '未精算'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

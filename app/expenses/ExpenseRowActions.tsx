'use client';

import { deleteExpenses, unsetExpense } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
    expenseId: string;
    status: string; // 'UNSETTLED' | 'SETTLED'
    settlementId?: string;
};

export function ExpenseRowActions({ expenseId, status, settlementId }: Props) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        if (!confirm('この経費を完全に削除しますか？')) return;
        setIsPending(true);
        const res = await deleteExpenses([expenseId]);
        if (res.success) {
            router.refresh();
        } else {
            alert('削除に失敗した可能性があります: ' + (res.error || 'Unknown error'));
            setIsPending(false);
            router.refresh(); // Sync state anyway
        }
    };

    const handleUnset = async () => {
        if (!confirm('この経費を精算済みから解除（未精算に戻す）しますか？')) return;
        setIsPending(true);
        const res = await unsetExpense(expenseId);
        if (res.success) {
            router.refresh();
        } else {
            alert('解除に失敗: ' + (res.error || 'Unknown error'));
            setIsPending(false);
        }
    };

    if (isPending) return <span className="text-xs text-slate-500 animate-pulse">処理中...</span>;

    if (status === 'SETTLED') {
        return (
            <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    済 {settlementId?.split('-').slice(-1)[0]}
                </span>
                <button
                    onClick={handleUnset}
                    className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-md transition-all"
                    title="精算解除（未精算に戻す）"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleDelete}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
            title="削除"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
        </button>
    );
}

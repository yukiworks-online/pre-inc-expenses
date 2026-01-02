'use client';

import { useState } from 'react';
import { deleteExpenses } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('本当にこの経費を削除しますか？\n（この操作は取り消せません）')) return;

        setIsDeleting(true);
        try {
            const result = await deleteExpenses([expenseId]);
            if (result.success) {
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

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 p-2.5 rounded-lg transition-all disabled:opacity-50 ml-4 shrink-0 flex items-center justify-center h-10 w-10 hover:border-red-500/30"
            title="削除"
        >
            {isDeleting ? (
                <span className="text-xs">...</span>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            )}
        </button>
    );
}

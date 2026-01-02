'use client';

import { useState } from 'react';
import { deleteExpense } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('本当にこの経費を削除しますか？\n（この操作は取り消せません）')) return;

        setIsDeleting(true);
        try {
            const result = await deleteExpense(expenseId);
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
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-all disabled:opacity-50"
            title="削除"
        >
            {isDeleting ? '...' : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
            )}
        </button>
    );
}

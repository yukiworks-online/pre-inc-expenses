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
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
            title="削除"
        >
            {isDeleting ? '...' : '削除'}
        </button>
    );
}

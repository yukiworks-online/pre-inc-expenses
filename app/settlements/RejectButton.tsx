'use client';

import { useRouter } from 'next/navigation';
import { rejectSettlement } from '@/app/actions';

export function RejectButton({ settlementId }: { settlementId: string }) {
    const router = useRouter();

    const handleReject = async () => {
        if (!confirm('この精算書を差し戻しますか？\n\n・含まれる全ての経費が「未精算」に戻ります。\n・この精算書Noは削除されます。')) {
            return;
        }

        const result = await rejectSettlement(settlementId);
        if (result.success) {
            alert('精算を差し戻しました。');
            router.push('/settlements');
            router.refresh();
        } else {
            alert('エラーが発生しました: ' + result.error);
        }
    };

    return (
        <button
            onClick={handleReject}
            className="btn px-6 py-3 shadow-lg rounded-full font-medium transition-all bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 pointer-events-auto"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            差し戻す
        </button>
    );
}

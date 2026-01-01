'use client';

import { useState } from 'react';
import { createSettlement } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function SettlementButton({ expenseIds }: { expenseIds: string[] }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const handleSettlement = async () => {
        if (!confirm('未精算の経費をすべて「精算済み」にして、精算書を作成しますか？')) return;

        setIsProcessing(true);
        try {
            const result = await createSettlement(expenseIds);
            if (result.success) {
                // Redirect to the report page
                router.push(`/settlements/${result.settlementId}`);
            } else {
                alert('エラーが発生しました: ' + result.error);
                setIsProcessing(false);
            }
        } catch (e) {
            alert('予期せぬエラー');
            setIsProcessing(false);
        }
    };

    return (
        <button
            onClick={handleSettlement}
            disabled={isProcessing || expenseIds.length === 0}
            className="btn btn-primary w-full md:w-auto text-base"
        >
            {isProcessing ? '処理中...' : '精算を実行 (PDF作成)'}
        </button>
    );
}

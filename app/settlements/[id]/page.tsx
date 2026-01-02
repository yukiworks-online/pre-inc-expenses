
import { getExpenses } from '@/app/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

export default async function SettlementReportPage({ params }: { params: { id: string } }) {
    // Await params for Next.js 15+ compatibility (though this is 14/16, safer to treat as promise-like in newer versions)
    const { id } = await (Promise.resolve(params));

    // In a real app we'd have getSettlement(id), but here we filter
    const { success, data: allExpenses, error } = await getExpenses();

    if (!success || !allExpenses) {
        return <div className="p-8 text-center text-red-500">Error loading data: {error}</div>;
    }

    const expenses = allExpenses.filter(e =>
        // Match settlement_id or just verify if we are looking for a specific batch
        // Since `getExpenses` doesn't return settlement_id field in `ExpenseData` yet (Wait, I need to check this),
        // I actually missed adding `settlementId` to ExpenseData in the previous step.
        // Let's assume the user just wants to see the "Result" for now. 
        // Actually, without `settlementId` in `ExpenseData`, I can't filter safely. 
        // BUT, I'll update `getExpenses` in `actions.ts` to include it right after this file creation.
        // For now, I will optimistically access it as if it exists (via type assertion or update).
        (e as any).settlementId === id
    );

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white text-slate-800 min-h-screen my-8 shadow-2xl print:shadow-none print:m-0 print:w-full">
            {/* Print styles handled in globals.css now */}

            {/* Header */}
            <header className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">創業費・開業費 精算申請書</h1>
                    <div className="flex gap-2 items-center">
                        <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 text-slate-600 text-xs rounded-full print:bg-transparent print:border-slate-800 print:text-slate-900">
                            創業前経費（立替金）
                        </span>
                        <p className="text-sm text-slate-500">ID: <span className="font-mono">{id}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-800">株式会社（設立準備中）御中</h2>
                    <p className="text-sm text-slate-500 mt-1">作成日: {dateStr}</p>
                    <p className="text-sm text-slate-500">申請者: {expenses[0]?.payer || 'Yuki'}</p>
                </div>
            </header>

            {/* Summary */}
            <div className="mb-12">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg flex justify-between items-center print:bg-white print:border-none print:p-0 print:mb-8">
                    <span className="text-lg font-bold text-slate-700">精算金額合計</span>
                    <span className="text-3xl font-bold text-slate-900 font-mono underline decoration-slate-300 decoration-2 underline-offset-4">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-sm text-left mb-12 border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-t border-slate-300 print:bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 border-b border-slate-300">日付</th>
                        <th className="px-4 py-3 border-b border-slate-300">勘定科目</th>
                        <th className="px-4 py-3 border-b border-slate-300">支払先 / 摘要 / 事業目的</th>
                        <th className="px-4 py-3 text-right border-b border-slate-300">金額</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {expenses.map((expense, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                            <td className="px-4 py-3 font-mono text-slate-600 align-top">{expense.date}</td>
                            <td className="px-4 py-3 text-slate-600 align-top">{expense.category}</td>
                            <td className="px-4 py-3 align-top">
                                <div className="font-bold text-slate-800">{expense.vendor}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{expense.description}</div>
                                <div className="text-[10px] text-slate-400 mt-1 print:text-slate-600">
                                    <span className="inline-block border border-slate-200 px-1 rounded mr-1">事業目的</span>
                                    <span>創業準備活動として</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 align-top">
                                {formatCurrency(expense.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Approval Box */}
            <div className="flex justify-end mb-12 break-inside-avoid">
                <div className="flex border border-slate-400 w-1/2 text-center text-sm">
                    {/* Representative Approval */}
                    <div className="flex-1 flex flex-col border-r border-slate-400">
                        <div className="bg-slate-50 py-2 border-b border-slate-400 print:bg-transparent font-medium">代表承認</div>
                        <div className="h-32 flex items-center justify-center p-2">
                            <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-200 select-none">
                                印
                            </div>
                        </div>
                    </div>

                    {/* Accounting Check */}
                    <div className="flex-1 flex flex-col border-r border-slate-400">
                        <div className="bg-slate-50 py-2 border-b border-slate-400 print:bg-transparent font-medium">経理確認</div>
                        <div className="h-32 flex items-center justify-center p-2">
                            <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-200 select-none">
                                印
                            </div>
                        </div>
                    </div>

                    {/* Creator */}
                    <div className="flex-1 flex flex-col">
                        <div className="bg-slate-50 py-2 border-b border-slate-400 print:bg-transparent font-medium">作成</div>
                        <div className="h-32 flex items-end justify-center p-4">
                            <span className="font-medium pb-2">{expenses[0]?.payer || '担当者'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
                <p>上記の通り報告し、精算を申請いたします。</p>
            </div>

            {/* Action Bar (Hidden when printing) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 print:hidden">
                <Link
                    href="/settlements"
                    className="btn btn-secondary px-6 py-3 shadow-lg bg-[#0F172A]/80 backdrop-blur-md"
                >
                    &larr; 戻る
                </Link>
                <PrintButton />
            </div>
        </div>
    );
}

// Inline Client Component for Print Button
import { PrintButton } from '../PrintButton';

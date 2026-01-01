import { getExpenses } from '@/app/actions';
import { PrintButton } from '../PrintButton';
import Link from 'next/link';

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

export default async function SettlementReportPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);
    const { success, data: allExpenses, error } = await getExpenses();

    if (!success || !allExpenses) {
        return <div className="p-8 text-center text-red-500">Error loading data: {error}</div>;
    }

    // Filter expenses for this settlement
    const expenses = allExpenses.filter(e => (e as any).settlementId === id);
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    const payerName = expenses[0]?.payer || '担当者';

    return (
        <div className="min-h-screen bg-slate-200 py-12 flex justify-center items-start print:bg-white print:py-0 print:block font-sans text-left">
            {/* A4 Sheet Container - Forced Styles to override global dark theme */}
            <div
                className="bg-white shadow-2xl relative print:shadow-none print:w-full print:m-0 break-after-page text-slate-900 box-border mx-auto print:left-0 print:top-0"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm',
                    color: 'black',
                    backgroundColor: 'white' // Force white background
                }}
            >

                {/* 1. Header Section */}
                <div className="flex justify-between items-end border-b-[3px] border-black pb-4 mb-8 relative">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">No. {id}</div>
                        <h1 className="text-3xl font-bold text-black tracking-widest leading-tight mt-1">経費精算書</h1>
                        <p className="text-sm font-medium text-slate-600 mt-2">創業準備費用（立替金）</p>
                    </div>

                    {/* Checkboxes - Moved to Top Right Position absolute to not mess flow, or just flex column */}
                    <div className="text-right flex flex-col items-end">
                        {/* Expense Type - Positioned at the top right of the header area */}
                        <div className="flex gap-4 mb-4 border border-slate-300 px-3 py-1.5 rounded-sm bg-slate-50 print:border-slate-400 print:bg-transparent">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg leading-none text-black">☑</span>
                                <span className="text-xs font-bold text-black leading-tight">創業費・開業費</span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-40 grayscale">
                                <span className="text-lg leading-none">☐</span>
                                <span className="text-xs font-medium text-slate-600">通常経費</span>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500 mb-2">作成日: {dateStr}</div>
                        <h2 className="text-lg font-bold text-black tracking-wide">株式会社Dialog 御中</h2>
                        <div className="mt-3 text-sm text-slate-800">
                            <span className="mr-2">申請者:</span>
                            <span className="font-semibold text-black text-base border-b border-slate-400 pb-0.5 inline-block min-w-[3em] text-center">
                                {payerName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Total Amount Section */}
                <div className="flex justify-center mb-12">
                    <div className="w-3/4 border-b-2 border-double border-slate-300 pb-2 text-center flex items-baseline justify-center gap-12">
                        <span className="text-sm font-bold text-slate-600">精算金額合計</span>
                        <span className="text-4xl font-bold text-black tracking-widest font-mono">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                </div>

                {/* 3. Details Table */}
                <div className="mb-12">
                    {/* 
                        Use standard table-layout: auto.
                        Use explicit no-wrap styles on critical columns.
                     */}
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-[2px] border-black text-slate-900">
                                <th
                                    className="py-2 px-2 text-center font-bold"
                                    style={{ width: '1%', whiteSpace: 'nowrap', minWidth: '100px' }}
                                >
                                    日付
                                </th>
                                <th
                                    className="py-2 px-2 text-center font-bold"
                                    style={{ width: '1%', whiteSpace: 'nowrap', minWidth: '100px' }}
                                >
                                    勘定科目
                                </th>
                                <th className="py-2 px-2 text-left font-bold w-auto">
                                    支払先 / 内容
                                </th>
                                <th
                                    className="py-2 px-2 text-center font-bold"
                                    style={{ width: '1%', whiteSpace: 'nowrap', minWidth: '120px' }}
                                >
                                    金額
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense, i) => (
                                <tr key={i} className="border-b border-slate-300 hover:bg-slate-50 print:hover:bg-transparent">
                                    <td
                                        className="py-3 px-2 align-top font-mono text-slate-700 text-center"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {expense.date}
                                    </td>
                                    <td
                                        className="py-3 px-2 align-top text-slate-800 font-medium text-center"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 print:border-none print:bg-transparent print:p-0">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 align-top text-slate-800 text-left">
                                        <div className="font-bold text-black text-sm mb-1">{expense.vendor}</div>
                                        <div className="text-xs text-slate-700 leading-tight">
                                            {/* Business Purpose Tag */}
                                            <span className="inline-block border border-slate-400 text-slate-600 rounded-[2px] px-1 py-[1px] text-[10px] mr-1.5 align-middle mb-0.5 transform scale-90 origin-left">
                                                創業準備
                                            </span>
                                            <span className="align-middle">{expense.description}</span>
                                        </div>
                                    </td>
                                    <td
                                        className="py-3 px-2 align-top text-center font-mono font-bold text-black text-base"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {formatCurrency(expense.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Footer & Approval */}
                <div className="absolute bottom-[20mm] left-[20mm] right-[20mm]">
                    <div className="mb-8 text-left ml-4">
                        <p className="text-xs text-slate-500">上記の内容等は事実と相違ないことを証明し、精算を申請します。</p>
                    </div>

                    {/* Approval Box: Table Layout */}
                    <div className="flex justify-end pr-4">
                        <table style={{ width: '130mm' }} className="text-center table-fixed">
                            <tbody>
                                <tr>
                                    <td className="pb-6 font-bold tracking-[0.2em] text-black w-1/3">代表承認</td>
                                    <td className="pb-6 font-bold tracking-[0.2em] text-black w-1/3">経理確認</td>
                                    <td className="pb-6 font-bold tracking-[0.2em] text-black w-1/3">作成</td>
                                </tr>
                                <tr>
                                    <td className="align-top">
                                        <div className="mx-auto w-[20mm] h-[20mm] rounded-full border-[1.5px] border-black flex items-center justify-center text-slate-300 font-serif select-none text-xs">
                                            印
                                        </div>
                                    </td>
                                    <td className="align-top">
                                        <div className="mx-auto w-[20mm] h-[20mm] rounded-full border-[1.5px] border-black flex items-center justify-center text-slate-300 font-serif select-none text-xs">
                                            印
                                        </div>
                                    </td>
                                    <td className="align-bottom pb-2">
                                        <div className="mx-auto w-full max-w-[30mm] border-b border-black text-center pb-1">
                                            <span className="font-medium text-black truncate block text-base">
                                                {payerName}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar - Robust Bottom Fixed Layout */}
            <div className="fixed bottom-0 left-0 right-0 py-6 flex justify-center items-center gap-4 print:hidden z-[9999] pointer-events-none">
                <Link
                    href="/settlements"
                    className="btn btn-secondary px-6 py-3 shadow-lg bg-slate-900/90 text-white hover:bg-slate-800 backdrop-blur-md rounded-full font-medium transition-all pointer-events-auto"
                >
                    &larr; 一覧へ戻る
                </Link>
                <div className="pointer-events-auto">
                    <PrintButton />
                </div>
            </div>
        </div>
    );
}

import { getExpensesFresh } from '@/app/actions';
import { PrintButton } from '../PrintButton';
import { RejectButton } from '../RejectButton';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

export default async function SettlementReportPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);
    const { success, data: allExpenses, error } = await getExpensesFresh();

    if (!success || !allExpenses) {
        return <div className="p-8 text-center text-red-500">Error loading data: {error}</div>;
    }

    // Filter expenses for this settlement
    const expenses = allExpenses.filter(e => (e as any).settlementId === id);
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    const payerName = expenses[0]?.payer || '担当者';

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-200 py-12 flex justify-center items-start print:bg-white print:py-0 print:block font-sans text-left">
                {/* A4 Sheet Container */}
                <div
                    className="bg-white shadow-2xl relative print:shadow-none print:w-full print:m-0 break-after-page text-slate-900 box-border mx-auto print:left-0 print:top-0"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        color: 'black',
                        backgroundColor: 'white'
                    }}
                >

                    {/* 1. Header Section */}
                    <div className="flex justify-between items-end border-b-[3px] border-black pb-4 mb-8 relative">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">No. {id}</div>
                            <h1 className="text-3xl font-bold text-black tracking-widest leading-tight mt-1">経費精算書</h1>
                            <p className="text-sm font-medium text-slate-600 mt-2">創業準備費用（立替金）</p>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            {/* Checkbox: "創業前経費チェック" */}
                            <div className="flex gap-4 mb-4 border border-slate-300 px-3 py-1.5 rounded-sm bg-slate-50 print:border-slate-400 print:bg-transparent">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-lg leading-none text-black">☑</span>
                                    <span className="text-xs font-bold text-black leading-tight">創業前経費</span>
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
                        <table className="w-full text-sm border-collapse table-fixed">
                            <thead>
                                <tr className="border-b-[2px] border-black text-slate-900">
                                    <th className="py-2 px-2 text-center font-bold w-[100px] whitespace-nowrap">
                                        日付
                                    </th>
                                    <th className="py-2 px-2 text-center font-bold w-[120px] whitespace-nowrap">
                                        勘定科目
                                    </th>
                                    <th className="py-2 px-2 text-left font-bold w-auto">
                                        支払先 / 摘要 / 事業目的
                                    </th>
                                    <th className="py-2 px-2 text-center font-bold w-[120px] whitespace-nowrap">
                                        金額
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense, i) => (
                                    <tr key={i} className="border-b border-slate-300 hover:bg-slate-50 print:hover:bg-transparent">
                                        <td className="py-3 px-2 align-top font-mono text-slate-700 text-center whitespace-nowrap">
                                            {expense.date}
                                        </td>
                                        <td className="py-3 px-2 align-top text-slate-800 font-medium text-center whitespace-nowrap">
                                            <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 print:border-none print:bg-transparent print:p-0">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 align-top text-slate-800 text-left">
                                            <div className="font-bold text-black text-sm mb-1">{expense.vendor}</div>
                                            <div className="text-xs text-slate-700 leading-tight">
                                                <span className="align-middle">{expense.description}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="border border-slate-400 rounded-[2px] px-1 text-slate-500 scale-90 origin-left">事業目的</span>
                                                <span>創業準備活動として</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 align-top text-center font-mono font-bold text-black text-base whitespace-nowrap">
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

                        {/* Approval Box: Full Width */}
                        <div className="w-full">
                            <table className="w-full text-center table-fixed border-collapse">
                                <tbody>
                                    <tr>
                                        <td className="pb-4 font-bold tracking-[0.2em] text-black border-slate-300">代表承認</td>
                                        <td className="pb-4 font-bold tracking-[0.2em] text-black border-slate-300">経理確認</td>
                                        <td className="pb-4 font-bold tracking-[0.2em] text-black border-slate-300">作成</td>
                                    </tr>
                                    <tr>
                                        <td className="align-top border border-slate-300 h-[30mm] align-middle">
                                            <div className="mx-auto w-[22mm] h-[22mm] rounded-full border-[1.5px] border-black flex items-center justify-center text-slate-300 font-serif select-none text-xs">
                                                印
                                            </div>
                                        </td>
                                        <td className="align-top border border-slate-300 h-[30mm] align-middle">
                                            <div className="mx-auto w-[22mm] h-[22mm] rounded-full border-[1.5px] border-black flex items-center justify-center text-slate-300 font-serif select-none text-xs">
                                                印
                                            </div>
                                        </td>
                                        <td className="align-bottom pb-2 border border-slate-300 h-[30mm]">
                                            <div className="mx-auto w-full max-w-[40mm] border-b border-black text-center pb-1 mb-4">
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

                {/* Floating Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 py-6 flex justify-center items-center gap-4 print:hidden z-[9999] pointer-events-none">
                    <Link
                        href="/settlements"
                        className="btn btn-secondary px-6 py-3 shadow-lg bg-slate-900/90 text-white hover:bg-slate-800 backdrop-blur-md rounded-full font-medium transition-all pointer-events-auto"
                    >
                        &larr; 一覧へ戻る
                    </Link>
                    <div className="pointer-events-auto">
                        <RejectButton settlementId={id} />
                    </div>
                    <div className="pointer-events-auto">
                        <PrintButton />
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

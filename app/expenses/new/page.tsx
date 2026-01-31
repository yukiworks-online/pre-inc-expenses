'use client';

import { useState, useRef, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { processReceipt, registerExpense, type ExpenseData } from '@/app/actions';
import { getPublicStorageUrl } from '@/lib/storage-utils';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function NewExpensePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState<ExpenseData>({
        date: '',
        vendor: '',
        amount: 0,
        currency: 'JPY',
        description: '',
        payer: '', // Initialize empty, set in useEffect
        category: '創業費',
        receiptUrl: ''
    });

    useEffect(() => {
        if (user?.displayName && !formData.payer) {
            setFormData(prev => ({ ...prev, payer: user.displayName || '' }));
        } else if (user?.email && !formData.payer) {
            // Fallback if no display name
            setFormData(prev => ({ ...prev, payer: user.email?.split('@')[0] || 'Unknown' }));
        }
    }, [user, formData.payer]);

    const [showForm, setShowForm] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);
        setShowForm(false);

        const formDataPayload = new FormData();
        formDataPayload.append('file', file);

        try {
            const result = await processReceipt(formDataPayload);
            if (result.success) {
                const data = result.data;
                const filePath = result.receiptUrl; // This is a PATH now (receipts/...)

                // Construct Public URL for preview using shared utility
                const publicUrl = getPublicStorageUrl(filePath);

                setReceiptUrl(publicUrl || null); // Preview uses Full URL

                // Populate form with AI data
                setFormData({
                    date: data.document_date || new Date().toISOString().split('T')[0],
                    vendor: data.vendor_name || '',
                    amount: data.total_amount || 0,
                    currency: data.currency || 'JPY',
                    description: (data.line_items?.[0]?.description) || '経費',
                    payer: user?.displayName || (user?.email?.split('@')[0]) || '',
                    category: suggestCategory(data.vendor_name || ''),
                    receiptUrl: filePath || ''  // DB Save uses Path ONLY
                });
                setShowForm(true);
            } else {
                alert("解析に失敗しました: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("予期せぬエラーが発生しました。");
        } finally {
            setIsProcessing(false);
        }
    };

    const suggestCategory = (vendor: string) => {
        if (/タクシー|交通|電車/.test(vendor)) return '旅費交通費';
        if (/レストラン|カフェ|コーヒー/.test(vendor)) return '会議費';
        if (/Amazon|文具/.test(vendor)) return '消耗品費';
        return '雑費';
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await registerExpense(formData);
            if (result.success) {
                // Success Modal or Toast could be better, but native alert for MVP stability
                alert("経費を保存しました！");
                setShowConfirmModal(false);
                setShowForm(false);
                setReceiptUrl(null);
                setFormData({ ...formData, amount: 0, vendor: '', description: '' });
                router.refresh();
            } else {
                alert("保存に失敗しました: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("保存エラー");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-10 font-sans text-slate-200">
            <header className="space-y-2 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    経費登録
                </h1>
                <p className="text-slate-400">レシートをアップロードしてAI自動解析を行います（創業前経費対応）</p>
            </header>

            {/* Upload Section */}
            {!showForm && (
                <section className="glass-panel p-10 rounded-2xl animate-fade-in-up border border-white/5 bg-black/20 backdrop-blur-xl transition-all hover:bg-black/30">
                    <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                </section>
            )}

            {/* Editable Form Section */}
            {showForm && (
                <section className="animate-fade-in-up space-y-8">
                    <div className="flex gap-8 items-start">
                        {/* Receipt Preview (Left/Top) */}
                        {receiptUrl && (
                            <div className="hidden md:block w-1/3 sticky top-6">
                                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={receiptUrl} alt="Receipt" className="w-full h-auto object-cover" />
                                </div>
                                <a href={receiptUrl} target="_blank" rel="noreferrer" className="block text-center mt-2 text-xs text-accent-primary hover:underline">
                                    元画像を開く
                                </a>
                            </div>
                        )}

                        {/* Form (Right/Main) */}
                        <div className="flex-1 glass-panel p-8 rounded-2xl border border-white/10 bg-[#0F1115]">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-accent-primary rounded-full" />
                                解析結果の確認・編集
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Date & Vendor */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">日付</label>
                                        <input
                                            type="date"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all font-mono"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">支払先 (店舗名)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">金額 (税込)</label>
                                    <div className="flex gap-2">
                                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-400 font-mono font-bold flex items-center select-none">
                                            ¥
                                        </div>
                                        <input
                                            type="number"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 font-mono text-2xl font-bold tracking-tight text-right pr-6"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {/* Category & Payer */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">勘定科目</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="創業費">創業費</option>
                                            <option value="開業費">開業費</option>
                                            <option value="消耗品費">消耗品費</option>
                                            <option value="旅費交通費">旅費交通費</option>
                                            <option value="会議費">会議費</option>
                                            <option value="交際費">交際費</option>
                                            <option value="通信費">通信費</option>
                                            <option value="地代家賃">地代家賃</option>
                                            <option value="水道光熱費">水道光熱費</option>
                                            <option value="広告宣伝費">広告宣伝費</option>
                                            <option value="新聞図書費">新聞図書費</option>
                                            <option value="支払手数料">支払手数料</option>
                                            <option value="租税公課">租税公課</option>
                                            <option value="車両費">車両費</option>
                                            <option value="外注工賃">外注工賃</option>
                                            <option value="システム利用料">システム利用料</option>
                                            <option value="雑費">雑費</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">立替者 (申請者)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                            value={formData.payer}
                                            onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                                            placeholder="名前を入力"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">摘要 / 品目</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[100px] resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className="flex justify-end gap-4 pt-8">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="btn btn-ghost"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    className="btn btn-primary px-8"
                                >
                                    確認画面へ
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1A1D24] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* ... (keep modal content) ... */}
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white">登録内容の確認</h3>
                            <p className="text-slate-400 text-sm mt-1">以下の内容でスプレッドシートに保存しますか？</p>
                        </div>

                        <div className="p-6 space-y-4 text-sm">
                            {/* ... (keep form preview) ... */}
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">日付</span>
                                <span className="font-mono text-white">{formData.date}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">支払先</span>
                                <span className="text-white font-medium">{formData.vendor}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-400">勘定科目</span>
                                <span className="text-white bg-white/10 px-2 py-0.5 rounded text-xs">{formData.category}</span>
                            </div>
                            <div className="flex justify-between py-2 items-center">
                                <span className="text-slate-400">金額</span>
                                <span className="text-2xl font-bold text-accent-primary font-mono">
                                    ¥{formData.amount.toLocaleString()}
                                </span>
                            </div>
                            <div className="py-2">
                                <span className="text-slate-400 block mb-1">摘要</span>
                                <p className="text-white/80 bg-black/20 p-3 rounded text-xs leading-relaxed max-h-24 overflow-auto">
                                    {formData.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="btn btn-ghost"
                                disabled={isSaving}
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn btn-primary"
                            >
                                {isSaving ? "保存中..." : "確定して保存"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

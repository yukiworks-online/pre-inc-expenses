'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isProcessing?: boolean;
}

export function FileUpload({ onFileSelect, isProcessing = false }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            className={cn(
                "relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                isDragging
                    ? "border-accent-primary bg-accent-primary/10 scale-[1.02]"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5",
                isProcessing && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleChange}
                disabled={isProcessing}
            />

            <div className="z-10 flex flex-col items-center gap-4 p-6 text-center">
                <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-accent-primary to-accent-secondary mb-2 shadow-lg shadow-accent-primary/20",
                    isProcessing && "animate-pulse"
                )}>
                    {isProcessing ? (
                        <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-xl font-medium text-white/90">
                        {isProcessing ? "AI解析を実行中..." : "ファイルを選択"}
                    </p>
                    <p className="text-sm text-gray-400">
                        {isProcessing ? "Geminiがレシートを読み取っています" : "クリックまたはドラッグ＆ドロップ"}
                    </p>
                </div>
            </div>

            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none" />
        </div>
    );
}

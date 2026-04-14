'use server';

import { extractReceiptData } from '@/lib/gemini';
import { getAdminStorage } from '@/lib/firebase-admin';
import { getSheet } from '@/lib/sheets';
import { randomUUID } from 'crypto';

export async function processReceiptFromStorage(storagePath: string, mimeType?: string) {
    try {
        if (!storagePath) {
            throw new Error('No receipt path provided');
        }

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'pj-settlement.firebasestorage.app';
        const bucket = getAdminStorage().bucket(bucketName);
        const fileRef = bucket.file(storagePath);

        const [exists] = await fileRef.exists();
        if (!exists) {
            throw new Error('Uploaded receipt file not found in storage');
        }

        const [buffer] = await fileRef.download();
        const [metadata] = await fileRef.getMetadata();
        const resolvedMimeType = mimeType || metadata.contentType || 'application/octet-stream';

        const extractedData = await extractReceiptData(buffer, resolvedMimeType);

        return {
            success: true,
            receiptUrl: storagePath,
            data: extractedData
        };

    } catch (error: any) {
        console.error("Failed to process receipt:", error);
        return { success: false, error: error.message };
    }
}

export type ExpenseData = {
    id?: string;
    date: string;
    vendor: string;
    amount: number;
    currency: string;
    description: string;
    payer: string;
    category: string;
    receiptUrl?: string;
    status?: string;
    settlementId?: string;
};

export type Expense = ExpenseData;


export async function registerExpense(data: ExpenseData) {
    try {
        const sheet = await getSheet('Expenses');

        const newExpense = {
            expense_id: randomUUID(),
            incurred_date: data.date,
            payer: data.payer,
            vendor: data.vendor,
            description: data.description,
            amount_gross: data.amount,
            currency: data.currency,
            payment_method: 'Cash/Personal Card',
            receipt_url: data.receiptUrl || '',
            category: data.category,
            pre_incorporation: 'TRUE',
            settlement_status: 'UNSETTLED',
            settlement_id: '',
            ai_extract_status: 'VERIFIED',
            created_at: new Date().toISOString()
        };

        await sheet.addRow(newExpense);

        return { success: true };
    } catch (error: any) {
        console.error("Failed to save expense:", error);
        return { success: false, error: error.message };
    }
}

import { unstable_noStore as noStore } from 'next/cache';

export async function getExpensesFresh() {
    noStore(); // Disable cache
    try {
        const sheet = await getSheet('Expenses');
        const rows = await sheet.getRows();

        // Map sheet rows to ExpenseData
        const expenses = await Promise.all(rows.map(async (row) => {
            // Retrieve path from spreadsheet (e.g., "receipts/abc.jpg")
            const rawPath = row.get('receipt_url');

            // Generate a temporary signed URL so images work even with restricted Storage rules
            const finalUrl = await getSignedUrlForPath(rawPath);

            return {
                id: row.get('expense_id'),
                date: row.get('incurred_date'),
                vendor: row.get('vendor'),
                amount: Number(row.get('amount_gross') || 0),
                currency: row.get('currency'),
                description: row.get('description'),
                payer: row.get('payer'),
                category: row.get('category'),
                receiptUrl: finalUrl,
                status: row.get('settlement_status') || 'UNSETTLED',
                settlementId: row.get('settlement_id'),
            };
        }));

        return { success: true, data: expenses.reverse() };
    } catch (error: any) {
        console.error("Failed to fetch expenses:", error);
        return { success: false, error: error.message };
    }
}

// Helper to generate signed URL
async function getSignedUrlForPath(filePath: string): Promise<string | undefined> {
    try {
        if (!filePath) {
            return undefined;
        }

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'pj-settlement.firebasestorage.app';
        const bucket = getAdminStorage().bucket(bucketName);
        const file = bucket.file(filePath);

        // Check if file exists to avoid signing non-existent files (optional but good)
        // For performance we might skip existence check, but let's just sign it.

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000, // Valid for 24 hours
        });
        return url;
    } catch (e) {
        console.warn(`Failed to sign URL for path ${filePath}:`, e);
        return undefined;
    }
}

export async function createSettlement(expenseIds: string[]) {
    try {
        const sheet = await getSheet('Expenses');
        const rows = await sheet.getRows();
        const settlementId = `ST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 4).toUpperCase()}`;
        let count = 0;

        for (const row of rows) {
            // Check if this row is one of the target expenses
            if (expenseIds.includes(row.get('expense_id'))) {
                row.set('settlement_status', 'SETTLED');
                row.set('settlement_id', settlementId);
                await row.save();
                count++;
            }
        }

        return { success: true, settlementId, count };
    } catch (error: any) {
        console.error("Settlement failed:", error);
        return { success: false, error: error.message };
    }
}


export async function deleteExpenses(expenseIds: string[]) {
    try {
        const sheet = await getSheet('Expenses');
        const rows = await sheet.getRows();
        const targetRows = rows.filter(r => expenseIds.includes(r.get('expense_id')));

        if (targetRows.length === 0) {
            return { success: false, error: 'Target expenses not found' };
        }

        // Check for already settled expenses
        const settled = targetRows.find(r => r.get('settlement_status') === 'SETTLED');
        if (settled) {
            return { success: false, error: 'Cannot delete settled expenses' };
        }

        // IMPORTANT: Sort by rowIndex in descending order to prevent index shifting
        // when deleting multiple rows sequentially.
        targetRows.sort((a, b) => (b as any).rowIndex - (a as any).rowIndex);

        // Delete all target rows
        for (const row of targetRows) {
            await row.delete();
        }

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete expenses:", error);
        return { success: false, error: error.message };
    }
}

export async function rejectSettlement(settlementId: string) {
    if (!settlementId) return { success: false, error: 'Settlement ID is required' };

    try {
        const sheet = await getSheet('Expenses');
        const rows = await sheet.getRows();

        // Find all rows with this settlement ID
        const targetRows = rows.filter(r => r.get('settlement_id') === settlementId);

        if (targetRows.length === 0) {
            return { success: false, error: 'Settlement not found' };
        }

        for (const row of targetRows) {
            row.set('settlement_status', 'UNSETTLED');
            row.set('settlement_id', '');
            await row.save();
        }

        return { success: true, count: targetRows.length };
    } catch (error: any) {
        console.error("Failed to reject settlement:", error);
        return { success: false, error: error.message };
    }
}

export async function unsetExpense(expenseId: string) {
    try {
        const sheet = await getSheet('Expenses');
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('expense_id') === expenseId);

        if (!row) return { success: false, error: 'Expense not found' };

        row.set('settlement_status', 'UNSETTLED');
        row.set('settlement_id', '');
        await row.save();

        return { success: true };
    } catch (error: any) {
        console.error("Failed to unset expense:", error);
        return { success: false, error: error.message };
    }
}

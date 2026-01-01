import { NextResponse } from 'next/server';
import { initializeSheets } from '@/lib/sheets';

export async function GET() {
    try {
        await initializeSheets();
        return NextResponse.json({ success: true, message: "Sheets initialized successfully" });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Config variables
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle escaped newlines
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
  // It's okay to log this on build time, but runtime it will fail
  console.warn("Missing Google Sheets Credentials");
}

const auth = new JWT({
  email: SERVICE_ACCOUNT_EMAIL,
  key: PRIVATE_KEY,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

export const doc = new GoogleSpreadsheet(SHEET_ID || "", auth);

export const HEADERS = {
  EXPENSES: [
    'expense_id', 'incurred_date', 'payer', 'vendor', 'description',
    'amount_gross', 'currency', 'payment_method', 'receipt_url',
    'category', 'pre_incorporation', 'settlement_status', 'settlement_id',
    'ai_extract_status', 'created_at'
  ],
  SETTLEMENTS: [
    'settlement_id', 'created_at', 'payer', 'amount_total', 'status', 'pdf_url'
  ]
};

export async function getSheet(title: string) {
  await doc.loadInfo();
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ title });
  }
  return sheet;
}

export async function initializeSheets() {
  await doc.loadInfo();

  // Expenses Sheet
  let expensesSheet = doc.sheetsByTitle['Expenses'];
  if (!expensesSheet) {
    expensesSheet = await doc.addSheet({ title: 'Expenses', headerValues: HEADERS.EXPENSES });
  } else {
    // Simple check if headers exist, if not set them (optional, careful not to overwrite)
    // For MVP, we assume if sheet exists, it's okay.
  }

  // Settlements Sheet
  let settlementsSheet = doc.sheetsByTitle['Settlements'];
  if (!settlementsSheet) {
    settlementsSheet = await doc.addSheet({ title: 'Settlements', headerValues: HEADERS.SETTLEMENTS });
  }
}

import { Transaction } from '../types';
import { getAccessToken } from './auth';

const STORAGE_KEY = 'finance_spreadsheet_id';
const SHEET_NAME = 'Transactions';

export const getSpreadsheetId = () => localStorage.getItem(STORAGE_KEY);
export const setSpreadsheetId = (id: string) => localStorage.setItem(STORAGE_KEY, id);
export const clearSpreadsheetId = () => localStorage.removeItem(STORAGE_KEY);

// ==========================================
// HELPER AUTHENTICATION
// ==========================================
async function getAuthHeaders() {
  const token = getAccessToken(); // Mengambil token langsung dari sessionStorage
  if (!token) {
    throw new Error('Google Access Token tidak ditemukan. Silakan login kembali.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ==========================================
// FUNGSI INISIALISASI SHEET
// ==========================================
export async function createSpreadsheet(): Promise<string> {
  const headers = await getAuthHeaders();
  const response = await fetch('https://sheets.googleapis.com/v1/spreadsheets', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: { title: 'Smart Finance Dashboard Sync' },
      sheets: [{ properties: { title: SHEET_NAME } }],
    }),
  });

  if (!response.ok) throw new Error('Gagal membuat file spreadsheet baru.');

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;

  if (spreadsheetId) {
    setSpreadsheetId(spreadsheetId);
    await initializeSheetHeaders(spreadsheetId);
  }
  return spreadsheetId;
}

async function initializeSheetHeaders(spreadsheetId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const range = `${SHEET_NAME}!A1:E1`;
  const values = [['ID Transaksi', 'Tanggal', 'Kategori', 'Jumlah', 'Keterangan']];

  await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ values }),
  });
}

// ==========================================
// FUNGSI CRUD STANDAR YANG DIBUTUHKAN App.tsx
// ==========================================

// Fungsi mengambil data saat aplikasi pertama kali dimuat
// Tambahkan parameter 'providedSheetId' di dalam kurung
export async function fetchTransactions(providedSheetId?: string): Promise<Transaction[]> {
  try {
    // Gunakan ID yang dikirim dari App.tsx, ATAU ambil dari getSpreadsheetId(), ATAU dari localStorage
    const spreadsheetId = providedSheetId || getSpreadsheetId() || localStorage.getItem('userSheetId');

    if (!spreadsheetId) return [];

    const headers = await getAuthHeaders();
    const response = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A2:E`, {
      headers,
    });

    if (!response.ok) return [];

    const data = await response.json();
    const rows = data.values || [];

    // Mengubah data baris Google Sheet menjadi bentuk object Transaction
    return rows.map((row: any) => ({
      id: row[0],
      date: row[1],
      category: row[2],
      amount: Number(row[3]),
      description: row[4] || '',
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Fungsi dummy untuk mencegah App.tsx error saat import
export async function addTransactionToSheet(sheetId: string, tx: Omit<Transaction, 'id'>) {
  // Jika Anda memakai syncTransactions (Auto-Save), fungsi ini bisa dibiarkan kosong
  console.log("Gunakan syncTransactions untuk auto-save data baru.");
}

export async function updateTransactionInSheet(sheetId: string, tx: Omit<Transaction, 'id'>){
  console.log("Gunakan syncTransactions untuk auto-save data yang diubah.");
}

export async function deleteTransactionFromSheet(id: string) {
  console.log("Gunakan syncTransactions untuk auto-save data yang dihapus.");
}

// ==========================================
// FUNGSI AUTO-SAVE (SYNC KESELURUHAN)
// ==========================================
export async function syncTransactions(transactions: Transaction[]): Promise<void> {
  try {
    let spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      spreadsheetId = await createSpreadsheet();
    }

    const headers = await getAuthHeaders();
    const range = `${SHEET_NAME}!A2:E`;
    const values = transactions.map(t => [t.id, t.date, t.category, t.amount, t.description || '']);

    await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
      method: 'POST',
      headers,
    });

    const response = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values }),
    });

    if (!response.ok) throw new Error('Gagal sinkronisasi data ke Google Sheets.');
    console.log('Data transaksi berhasil di-auto-save ke Google Sheets!');
  } catch (error) {
    console.error('Error saat syncTransactions:', error);
  }
}
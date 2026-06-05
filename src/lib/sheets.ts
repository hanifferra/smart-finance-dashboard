import { Transaction } from '../types';
import { getAccessToken } from './auth';

const STORAGE_KEY = 'finance_spreadsheet_id';

export const getSpreadsheetId = () => localStorage.getItem(STORAGE_KEY);
export const setSpreadsheetId = (id: string) => localStorage.setItem(STORAGE_KEY, id);
export const clearSpreadsheetId = () => localStorage.removeItem(STORAGE_KEY);

const SHEET_NAME = 'Transactions';

/**
 * Helper untuk mengambil token dan menyusun HTTP Headers.
 * Menghindari pengulangan kode di setiap fungsi API.
 */
async function getAuthHeaders() {
  // Jika getAccessToken di auth.ts mengembalikan Promise, gunakan await.
  // Jika sinkronus, Anda bisa menghapus keyword 'await' di bawah ini.
  const token = await getAccessToken(); 
  
  if (!token) {
    throw new Error('Google Access Token tidak ditemukan. Silakan login kembali.');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Membuat file Spreadsheet baru di Google Drive pengguna jika belum ada
 */
export async function createSpreadsheet(): Promise<string> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch('https://sheets.googleapis.com/v1/spreadsheets', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        properties: {
          title: 'Smart Finance Dashboard Sync',
        },
        sheets: [
          {
            properties: {
              title: SHEET_NAME,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gagal membuat file spreadsheet baru.');
    }

    const data = await response.json();
    const spreadsheetId = data.spreadsheetId;
    
    if (spreadsheetId) {
      setSpreadsheetId(spreadsheetId);
      // Inisialisasi baris pertama (Header Tabel) otomatis setelah sheet dibuat
      await initializeSheetHeaders(spreadsheetId);
    }
    
    return spreadsheetId;
  } catch (error) {
    console.error('Error saat createSpreadsheet:', error);
    throw error;
  }
}

/**
 * Membuat struktur kolom (Header) di baris pertama spreadsheet baru
 */
async function initializeSheetHeaders(spreadsheetId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const range = `${SHEET_NAME}!A1:E1`;
  const values = [['ID Transaksi', 'Tanggal', 'Kategori', 'Jumlah', 'Keterangan']];

  await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({ values }),
  });
}

/**
 * Fungsi Auto-Save untuk sinkronisasi seluruh data transaksi terbaru ke Google Sheets
 */
export async function syncTransactions(transactions: Transaction[]): Promise<void> {
  try {
    let spreadsheetId = getSpreadsheetId();
    
    // Proteksi: Jika ID sheet hilang/belum ada di localStorage, buat otomatis
    if (!spreadsheetId) {
      spreadsheetId = await createSpreadsheet();
    }

    const headers = await getAuthHeaders();
    const range = `${SHEET_NAME}!A2:E`;
    
    // Mapping data transaksi ke format array dua dimensi yang dikenali Google Sheets
    const values = transactions.map(t => [
      t.id,
      t.date,
      t.category,
      t.amount,
      t.description || ''
    ]);

    // 1. Bersihkan sisa data lama di sheet agar sinkronisasi akurat (jika ada transaksi dihapus di UI)
    await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
      method: 'POST',
      headers: headers,
    });

    // 2. Tulis data transaksi yang paling baru mulai dari baris ke-2
    const response = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      throw new Error('Gagal memperbarui data di Google Sheets.');
    }
    
    console.log('Data transaksi berhasil tersinkronisasi ke Google Sheets!');
  } catch (error) {
    console.error('Error saat syncTransactions:', error);
    throw error;
  }
}
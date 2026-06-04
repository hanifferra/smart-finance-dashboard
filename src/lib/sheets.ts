import { Transaction } from '../types';
import { getAccessToken } from './auth';

const STORAGE_KEY = 'finance_spreadsheet_id';

export const getSpreadsheetId = () => localStorage.getItem(STORAGE_KEY);
export const setSpreadsheetId = (id: string) => localStorage.setItem(STORAGE_KEY, id);
export const clearSpreadsheetId = () => localStorage.removeItem(STORAGE_KEY);

const SHEET_NAME = 'Transactions';

export async function createSpreadsheet(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Smart Finance Data',
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

  if (!res.ok) {
    throw new Error('Failed to create spreadsheet');
  }

  const data = await res.json();
  const id = data.spreadsheetId;
  setSpreadsheetId(id);
  
  // Set up headers
  await appendRow(id, ['ID', 'Type', 'Amount', 'Category', 'Description', 'Date']);
  
  return id;
}

export async function fetchTransactions(spreadsheetId: string): Promise<Transaction[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A2:F`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 404) {
        throw new Error('Spreadsheet not found');
    }
    throw new Error('Failed to fetch transactions');
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows.map((row: any[]) => ({
    id: row[0],
    type: row[1] as 'income' | 'expense',
    amount: Number(row[2]),
    category: row[3] as any,
    description: row[4],
    date: row[5],
  })).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function appendRow(spreadsheetId: string, values: any[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A:F:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [values],
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to append row');
  }
}

export async function addTransactionToSheet(spreadsheetId: string, transaction: Transaction) {
  await appendRow(spreadsheetId, [
    transaction.id,
    transaction.type,
    transaction.amount,
    transaction.category,
    transaction.description,
    transaction.date,
  ]);
}

export async function updateTransactionInSheet(spreadsheetId: string, transaction: Transaction) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A:A`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch for update');
  
  const data = await res.json();
  const rows = data.values || [];
  
  const rowIndex = rows.findIndex((r: any[]) => r[0] === transaction.id);
  if (rowIndex === -1) throw new Error('Transaction not found in sheet');

  const rowNumber = rowIndex + 1; // 1-based index

  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A${rowNumber}:F${rowNumber}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [[
        transaction.id,
        transaction.type,
        transaction.amount,
        transaction.category,
        transaction.description,
        transaction.date,
      ]],
    }),
  });

  if (!updateRes.ok) {
    throw new Error('Failed to update row');
  }
}



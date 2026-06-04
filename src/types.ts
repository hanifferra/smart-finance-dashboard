export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Makanan' 
  | 'Transportasi' 
  | 'Tagihan' 
  | 'Belanja' 
  | 'Gaji' 
  | 'Lainnya';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string Date
}

export interface SmartInputResult {
  type: TransactionType;
  amount: number | null;
  category: Category;
  description: string;
  date: Date;
}

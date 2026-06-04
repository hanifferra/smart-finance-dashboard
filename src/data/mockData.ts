import { Transaction } from '@/src/types';
import { subDays } from 'date-fns';

const today = new Date();

export const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 50000,
    category: 'Makanan',
    description: 'Makan siang padang',
    date: today.toISOString(),
  },
  {
    id: '2',
    type: 'income',
    amount: 5000000,
    category: 'Gaji',
    description: 'Gaji bulan Juni',
    date: today.toISOString(),
  },
  {
    id: '3',
    type: 'expense',
    amount: 150000,
    category: 'Tagihan',
    description: 'Token listrik',
    date: subDays(today, 1).toISOString(),
  },
  {
    id: '4',
    type: 'expense',
    amount: 30000,
    category: 'Transportasi',
    description: 'Bensin motor',
    date: subDays(today, 2).toISOString(),
  },
  {
    id: '5',
    type: 'expense',
    amount: 250000,
    category: 'Belanja',
    description: 'Belanja bulanan',
    date: subDays(today, 3).toISOString(),
  },
];

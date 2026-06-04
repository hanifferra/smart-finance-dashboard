import React from 'react';
import { Transaction } from '@/src/types';
import { format } from 'date-fns';
import { 
  Utensils, 
  Car, 
  Lightbulb, 
  ShoppingBag, 
  Wallet, 
  MoreHorizontal 
} from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const getIconAndColor = (category: string) => {
    switch (category) {
      case 'Makanan':
        return { icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'Transportasi':
        return { icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'Tagihan':
        return { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'Belanja':
        return { icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'Gaji':
        return { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      default:
        return { icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const { icon: Icon, color, bg } = getIconAndColor(transaction.category);
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(transaction.amount);

  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center p-4 rounded-2xl bg-white hover:bg-slate-50 transition-all cursor-pointer border border-slate-100 shadow-[0_4px_14px_0_rgb(0,0,0,0.02)] group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${bg} ${color}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <h4 className="font-bold font-display text-slate-900 truncate">
          {transaction.description}
        </h4>
        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
          {transaction.category} • {format(new Date(transaction.date), 'dd MMM')}
        </p>
      </div>
      
      <div className="ml-4 text-right">
        <p className={`font-display font-bold text-lg tracking-tight ${isIncome ? 'text-emerald-500' : 'text-slate-900 group-hover:text-rose-500 transition-colors'}`}>
          {isIncome ? '+' : '-'}{formattedAmount.replace('Rp', '')}
        </p>
      </div>
    </div>
  );
}

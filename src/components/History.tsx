import React, { useState, useMemo } from 'react';
import { Transaction } from '@/src/types';
import { TransactionCard } from '@/src/components/TransactionCard';
import { EditTransactionModal } from '@/src/components/EditTransactionModal';
import { ArrowLeft, Search, Ghost } from 'lucide-react';

interface HistoryProps {
  transactions: Transaction[];
  onBack: () => void;
  onUpdateTransaction: (tx: Transaction) => Promise<void>;
}

type FilterType = 'All' | 'expense' | 'income';

export function History({ transactions, onBack, onUpdateTransaction }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Apply type filter
      if (filter !== 'All' && t.type !== filter) return false;
      
      // Apply search filter (match description or category)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, searchQuery]);

  const handleSaveUpdate = async (tx: Transaction) => {
    await onUpdateTransaction(tx);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-pink-50 px-5 pt-8 pb-4 sticky top-0 z-20 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-rose-100 transition-colors mr-2 text-rose-500"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-2xl font-display font-bold text-rose-600 tracking-tight">Riwayat Transaksi ✨</h1>
      </div>

      <div className="px-5 pt-2 flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="relative mb-5 shadow-[0_4px_14px_0_rgba(251,113,133,0.03)] rounded-2xl">
          <Search className="absolute left-4 top-[15px] text-pink-400" size={18} strokeWidth={2.5} />
          <input 
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-pink-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-rose-400 text-sm font-medium text-rose-800 placeholder:text-pink-400 transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {(['All', 'expense', 'income'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 ${
                filter === f 
                  ? 'bg-rose-400 text-white border-rose-400 shadow-[0_4px_10px_rgba(251,113,133,0.3)] transform -translate-y-0.5' 
                  : 'bg-white text-rose-400 border-pink-100 hover:border-rose-300'
              }`}
            >
              {f === 'All' ? 'Semua' : f === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </button>
          ))}
        </div>

        {/* Transaction List or Empty State */}
        <div className="flex-1 pb-8">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map(t => (
                <TransactionCard key={t.id} transaction={t} onClick={setEditingTransaction} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-5 text-rose-300 border-4 border-pink-50 shadow-inner">
                <Ghost size={48} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-display font-bold text-rose-600 mb-2">Masih Kosong!</h3>
              <p className="text-sm font-medium text-rose-400 max-w-[200px]">
                Tidak ada transaksi ditemukan nih. Coba ganti filter aja.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <EditTransactionModal 
        isOpen={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onSave={handleSaveUpdate}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Transaction, SmartInputResult } from '@/src/types';
import { TransactionCard } from '@/src/components/TransactionCard';
import { parseSmartInput } from '@/src/lib/nlp';
import { SmartInputModal } from '@/src/components/SmartInputModal';
import { ArrowLeftRight, Send, Sparkles, Asterisk, ArrowDownLeft, ArrowUpRight, LogOut, FileSpreadsheet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { User } from 'firebase/auth';

interface DashboardProps {
  transactions: Transaction[];
  onNavigateToHistory: () => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  user?: User | null;
  onLogout?: () => void;
  sheetUrl?: string | null;
}

const COLORS = ['#f97316', '#3b82f6', '#eab308', '#a855f7', '#64748b'];

export function Dashboard({ transactions, onNavigateToHistory, onAddTransaction, user, onLogout, sheetUrl }: DashboardProps) {
  const [smartInput, setSmartInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState<SmartInputResult | null>(null);

  const handleSmartInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;
    
    const parsed = parseSmartInput(smartInput);
    setParsedData(parsed);
    setIsModalOpen(true);
  };

  const handleSaveDraft = async (data: any) => {
    onAddTransaction(data);
    setIsModalOpen(false);
    setSmartInput('');
  };

  // Calc totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Calc chart data (only expenses)
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  })).sort((a, b) => b.value - a.value);

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  
  const firstName = user?.displayName?.split(' ')[0] || 'Budi';
  const initial = firstName.charAt(0);

  return (
    <div className="pb-8 bg-pink-50 min-h-screen font-sans">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-rose-600 tracking-tight">Halo, {firstName}! ✌️</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-rose-400 text-sm font-medium">Juni 2026 • Catatan Keuangan Kamu</p>
            {sheetUrl && (
              <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full hover:bg-teal-200 transition-colors">
                <FileSpreadsheet size={12} />
                <span>Sinkronisasi Sheets</span>
              </a>
            )}
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center border-[3px] border-rose-400 overflow-hidden shadow-[4px_4px_0_0_rgba(251,113,133,0.5)] hover:shadow-[2px_2px_0_0_rgba(251,113,133,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer relative group"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={firstName} className="w-full h-full object-cover group-hover:opacity-10" />
          ) : (
            <span className="text-xl font-display font-bold text-rose-600 group-hover:opacity-10">{initial}</span>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut size={20} className="text-rose-600" strokeWidth={2.5} />
          </div>
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Total Saldo Card (Gen Z Cute Bento) */}
        <div className="bg-rose-400 text-white p-7 rounded-[2rem] shadow-xl relative overflow-hidden group border-2 border-rose-300">
          <div className="absolute -top-12 -right-12 text-rose-500/30 group-hover:rotate-90 transition-transform duration-700">
            <Asterisk size={180} strokeWidth={1} />
          </div>
          <p className="text-rose-100 font-medium mb-2 uppercase tracking-widest text-xs">Total Saldo Kamu</p>
          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tighter relative z-10">{formatCurrency(balance)}</h3>
        </div>

        {/* Split Card (Income/Expense) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border-2 border-pink-100 shadow-[0_8px_30px_rgb(251,113,133,0.04)]">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-3">
              <ArrowDownLeft className="text-teal-500" size={20} strokeWidth={2.5} />
            </div>
            <p className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">Pemasukan</p>
            <h3 className="text-xl font-display font-bold text-teal-600">{formatCurrency(totalIncome)}</h3>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border-2 border-pink-100 shadow-[0_8px_30px_rgb(251,113,133,0.04)]">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mb-3">
              <ArrowUpRight className="text-rose-500" size={20} strokeWidth={2.5} />
            </div>
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Pengeluaran</p>
            <h3 className="text-xl font-display font-bold text-rose-600">{formatCurrency(totalExpense)}</h3>
          </div>
        </div>

        {/* Magic Input Section */}
        <div className="bg-violet-100 p-6 rounded-[2rem] shadow-sm border-2 border-violet-200 relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-4 relative z-10">
            <Sparkles size={20} className="text-violet-500" />
            <h2 className="font-bold font-display text-violet-600 text-lg">Catatan pintar di sini ya ✨</h2>
          </div>
          <form onSubmit={handleSmartInputSubmit} className="relative z-10">
            <input 
              type="text" 
              placeholder="e.g. Beli kopi 30k tadi pagi..."
              className="w-full bg-white/90 backdrop-blur-sm border-2 border-violet-300 rounded-xl py-4 pl-4 pr-14 focus:outline-none focus:ring-4 focus:ring-violet-200 text-sm font-medium text-violet-900 placeholder:text-violet-300"
              value={smartInput}
              onChange={e => setSmartInput(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 p-2.5 bg-violet-400 rounded-lg text-white hover:bg-violet-500 transition active:scale-95 flex items-center justify-center"
              disabled={!smartInput.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Quick Chart */}
        {chartData.length > 0 && (
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(251,113,133,0.04)] border border-pink-100">
            <h2 className="font-bold font-display text-rose-600 mb-6 text-lg">Pengeluaran 💸</h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | string | any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(251 113 133 / 0.1), 0 8px 10px -6px rgb(251 113 133 / 0.1)', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(251,113,133,0.04)] border border-pink-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold font-display text-rose-600 text-lg">Transaksi Terakhir</h2>
            <button 
              onClick={onNavigateToHistory}
              className="text-rose-400 hover:text-rose-600 text-sm font-bold transition-colors"
            >
              Lihat Semua
            </button>
          </div>
          
          <div className="space-y-3 overflow-hidden">
            {transactions.slice(0, 3).map(t => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
            
            {transactions.length === 0 && (
              <p className="text-center font-medium text-rose-300 py-6 text-sm">Belum ada transaksi</p>
            )}
          </div>
        </div>
      </div>

      <SmartInputModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parsedData={parsedData}
        onSave={handleSaveDraft}
      />
    </div>
  );
}

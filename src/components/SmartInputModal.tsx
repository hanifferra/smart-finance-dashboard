import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartInputResult, Category, TransactionType } from '@/src/types';
import { X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SmartInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: SmartInputResult | null;
  onSave: (data: Omit<SmartInputResult, 'amount'> & { amount: number }) => Promise<void>;
}

export function SmartInputModal({ isOpen, onClose, parsedData, onSave }: SmartInputModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>('Lainnya');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (parsedData) {
      setType(parsedData.type);
      setAmount(parsedData.amount ? parsedData.amount.toString() : '');
      setCategory(parsedData.category);
      setDescription(parsedData.description);
      setDateStr(format(parsedData.date, 'yyyy-MM-dd'));
    }
  }, [parsedData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsSaving(true);
    
    // Simulate network delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    await onSave({
      type,
      amount: Number(amount),
      category,
      description,
      date: new Date(dateStr)
    });
    
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(139,92,246,0.1)] border-2 border-violet-100 overflow-hidden p-6 font-sans"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold text-violet-600 tracking-tight">Konfirmasi ✨</h3>
            <button onClick={onClose} className="p-2 rounded-full text-violet-300 hover:bg-violet-50 hover:text-violet-600 transition-colors">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Tipe Transaksi</label>
              <div className="flex rounded-xl overflow-hidden border-2 border-violet-100 p-1 bg-violet-50 gap-1">
                <button 
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-violet-400 text-white shadow-md' : 'bg-transparent text-violet-500 hover:text-violet-600'}`}
                  onClick={() => setType('expense')}
                >
                  Pengeluaran
                </button>
                <button 
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-teal-400 text-white shadow-md' : 'bg-transparent text-violet-500 hover:text-teal-600'}`}
                  onClick={() => setType('income')}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Nominal (Rp)</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-0 py-2 border-b-2 border-violet-100 focus:border-violet-400 focus:outline-none focus:ring-0 font-display font-bold text-3xl transition-colors text-violet-600"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Keterangan</label>
              <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-0 py-2 border-b-2 border-violet-100 focus:border-violet-400 focus:outline-none focus:ring-0 font-bold transition-colors text-base text-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Kategori</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full px-0 py-2 border-b-2 border-violet-100 focus:border-violet-400 focus:outline-none focus:ring-0 font-bold transition-colors text-sm bg-white text-violet-500"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Tagihan">Tagihan</option>
                  <option value="Belanja">Belanja</option>
                  <option value="Gaji">Gaji</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Tanggal</label>
                <input 
                  type="date" 
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full px-0 py-2 border-b-2 border-violet-100 focus:border-violet-400 focus:outline-none focus:ring-0 font-bold transition-colors text-sm text-violet-500"
                />
              </div>
            </div>
          </div>

          <button 
            className="w-full mt-8 py-3.5 bg-violet-400 hover:bg-violet-500 text-white font-display font-bold text-lg rounded-xl flex justify-center items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(167,139,250,0.39)] border-none active:scale-95"
            onClick={handleSave}
            disabled={!amount || isSaving}
          >
            {isSaving ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              'Simpan Data'
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

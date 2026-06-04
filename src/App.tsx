/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/src/components/Dashboard';
import { History } from '@/src/components/History';
import { Login } from '@/src/components/Login';
import { Transaction } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { initAuth, googleSignIn, logout, getAccessToken } from '@/src/lib/auth';
import { fetchTransactions, addTransactionToSheet, createSpreadsheet, getSpreadsheetId, setSpreadsheetId, updateTransactionInSheet } from '@/src/lib/sheets';
import { User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
        loadData();
      },
      () => {
        setNeedsAuth(true);
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      let sheetId = getSpreadsheetId();
      if (!sheetId) {
        sheetId = await createSpreadsheet();
      }
      setSheetUrl(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
      const data = await fetchTransactions(sheetId);
      setTransactions(data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      if (err.message === 'Spreadsheet not found') {
        const sheetId = await createSpreadsheet();
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
        setTransactions([]);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        loadData();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setNeedsAuth(true);
    setTransactions([]);
    setUser(null);
    setSheetUrl(null);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substring(7),
    };
    
    // Optimistic UI update
    setTransactions(prev => [tx, ...prev]);
    
    // Background sync
    try {
      const sheetId = getSpreadsheetId();
      if (sheetId) {
        await addTransactionToSheet(sheetId, tx);
      }
    } catch (err) {
      console.error('Failed to sync to sheets:', err);
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    // Optimistic update
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    try {
      const sheetId = getSpreadsheetId();
      if (sheetId) {
        await updateTransactionInSheet(sheetId, updatedTx);
      }
    } catch (err) {
      console.error('Failed to update in sheets:', err);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden">
        {needsAuth ? (
          <Login onLogin={handleLogin} isLoading={isLoggingIn} />
        ) : (
          <>
            {isLoadingData && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
              </div>
            )}
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' ? (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto"
                >
                  <Dashboard 
                    transactions={transactions} 
                    onNavigateToHistory={() => setCurrentView('history')}
                    onAddTransaction={handleAddTransaction}
                    user={user}
                    onLogout={handleLogout}
                    sheetUrl={sheetUrl}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto bg-pink-50"
                >
                  <History 
                    transactions={transactions}
                    onBack={() => setCurrentView('dashboard')}
                    onUpdateTransaction={handleUpdateTransaction}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

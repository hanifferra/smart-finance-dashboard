import { SmartInputResult, Category, TransactionType } from '@/src/types';
import { subDays } from 'date-fns';

export function parseSmartInput(input: string): SmartInputResult {
  const lowerInput = input.toLowerCase();

  // 1. Determine Type
  let type: TransactionType = 'expense'; // Default to expense
  const incomeKeywords = ['gaji', 'terima', 'dapat', 'bonus', '+', 'masuk'];
  const expenseKeywords = ['beli', 'bayar', 'keluar', '-', 'kasih', 'makan'];
  
  if (incomeKeywords.some(kw => lowerInput.includes(kw))) {
    type = 'income';
  } else if (expenseKeywords.some(kw => lowerInput.includes(kw))) {
    type = 'expense';
  }

  // 2. Parse Amount
  let amount: number | null = null;
  // Match absolute numbers or numbers with suffixes like rb, k, juta
  const amountRegex = /(?:rp\s*)?(?:\d{1,3}(?:\.\d{3})*|\d+)(?:\s*(rb|ribu|k|jt|juta))?/g;
  const matches = lowerInput.match(amountRegex);
  
  if (matches && matches.length > 0) {
    // Take the first match
    let matchStr = matches[0].replace(/rp\s*/g, '');
    let multiplier = 1;
    
    if (matchStr.includes('rb') || matchStr.includes('ribu') || matchStr.includes('k')) {
      multiplier = 1000;
      matchStr = matchStr.replace(/rb|ribu|k/g, '');
    } else if (matchStr.includes('jt') || matchStr.includes('juta')) {
      multiplier = 1000000;
      matchStr = matchStr.replace(/jt|juta/g, '');
    }
    
    // Clean formatting e.g. 50.000 -> 50000
    const rawNumber = parseInt(matchStr.replace(/\./g, '').trim(), 10);
    if (!isNaN(rawNumber)) {
        amount = rawNumber * multiplier;
    }
  }

  // 3. Determine Category
  let category: Category = 'Lainnya'; // Default
  if (type === 'income') {
    if (lowerInput.includes('gaji')) category = 'Gaji';
  } else {
    const foodKw = ['makan', 'minum', 'kopi', 'nongkrong', 'kafe', 'padang', 'warteg'];
    const transportKw = ['bensin', 'grab', 'gojek', 'kereta', 'tol', 'parkir', 'krl'];
    const billsKw = ['listrik', 'token', 'air', 'internet', 'pulsa', 'kuota', 'tagihan', 'kos', 'pdam'];
    const shopKw = ['belanja', 'supermarket', 'indomaret', 'baju', 'sepatu', 'shopee', 'tokopedia'];

    if (foodKw.some(kw => lowerInput.includes(kw))) category = 'Makanan';
    else if (transportKw.some(kw => lowerInput.includes(kw))) category = 'Transportasi';
    else if (billsKw.some(kw => lowerInput.includes(kw))) category = 'Tagihan';
    else if (shopKw.some(kw => lowerInput.includes(kw))) category = 'Belanja';
  }

  // 4. Determine Date
  let date = new Date();
  if (lowerInput.includes('kemarin')) {
    date = subDays(date, 1);
  } else if (lowerInput.includes('lusa')) {
    date = subDays(date, 2);
  }

  // 5. Description is the original input
  const description = input.trim();

  return {
    type,
    amount,
    category,
    description,
    date,
  };
}

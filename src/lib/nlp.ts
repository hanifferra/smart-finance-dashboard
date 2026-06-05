import { SmartInputResult, Category, TransactionType } from '@/src/types';
import { GoogleGenAI, Type } from '@google/genai';

// Inisialisasi Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Mengubah fungsi parseSmartInput lama menjadi Async untuk mendukung Gemini API.
 * Pastikan Anda menambahkan kata kunci 'await' saat memanggil fungsi ini di komponen!
 */
export async function parseSmartInput(input: string): Promise<SmartInputResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Ekstrak data keuangan dari teks: "${input}"`,
      config: {
        systemInstruction: `
          Kamu adalah AI kasir pintar khusus Indonesia. Tugasmu adalah mengekstrak teks input mentah menjadi data terstruktur.
          
          Aturan ekstraksi:
          1. Tentukan 'type': 'income' jika teks mengindikasikan uang masuk/pemasukan, atau 'expense' jika uang keluar/pengeluaran.
          2. Konversi angka gaul/singkatan Indonesia (misal: 50rb -> 50000, 2jt -> 2000000, ceban -> 10000, gocap -> 50000) menjadi angka integer murni.
          3. Tentukan kategori singkat yang cocok (misal: Makanan, Transportasi, Gaji, Belanja, Hiburan).
          4. Ambil deskripsi nama barang/tempat/kegiatan secara ringkas.
        `,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['income', 'expense'] },
            amount: { type: Type.INTEGER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['type', 'amount', 'category', 'description'],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      
      // Kembalikan objek yang sesuai dengan tipe SmartInputResult proyek Anda
      return {
        type: data.type as TransactionType,
        amount: data.amount,
        category: data.category as Category,
        description: data.description,
        // Jika SmartInputResult membutuhkan properti tambahan seperti date, Anda bisa menambahkannya di sini:
        // date: new Date().toISOString()
        date: new Date(),
      };
    }

    throw new Error('Respons Gemini kosong');
  } catch (error) {
    console.error('Gagal memproses teks dengan Gemini:', error);
    
    // Fallback jika API error agar aplikasi tidak crash
    return {
      type: 'expense' as TransactionType,
      amount: 0,
      category: 'Lainnya' as Category,
      description: input,
      date: new Date(),
    };
  }
}
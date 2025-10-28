import { useState } from 'react';
import { extractTextFromImage } from '../utils/extract_receipt';
import { parseReceiptText } from '../utils/parse_receipt';
import { addTransaction } from '../api/transaction_api';

export const useReceipt = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const text = await extractTextFromImage(file);
      const transaction = parseReceiptText(text, userId);
      await addTransaction(transaction);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return { handleUpload, loading, error };
};

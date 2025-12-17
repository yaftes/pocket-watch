import { useState } from "react";
import { extractTextFromImage } from "../utils/extract_receipt";
import { addTransactionWithCategory, textFromApi } from "../utils/ai_service";

export const useReceipt = (userId: string) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleUpload = async (file: File) => {

    try {

      setLoading(true);
      setError(null);

      const extractedText = await extractTextFromImage(file);

      if (!extractedText.trim()) {
        throw new Error("No text detected in image");
      }

      const transaction = await textFromApi(extractedText);

      await addTransactionWithCategory(transaction, userId);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { handleUpload, loading, error };
};

import Tesseract from "tesseract.js";
import {
  extractReceiptDataWithAI,
  getGeminiApiKey,
  type AIExtractedData,
} from "./ai_service";

export type ParsedReceipt = {
  user_id: string;
  category: string;
  amount: number;
  note: string;
  created_at: string;
  merchant?: string;
  confidence?: number;
};


export const extractTextFromImage = async (file: File | string): Promise<string> => {
  try {
    const { data } = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        // Only log progress for debugging
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    return data.text;
  } catch (error) {
    console.error("Error extracting text:", error);
    return "";
  }
};


export const parseReceiptText = async (
  text: string,
  userId: string,
  availableCategories: string[] = ["Food", "Transport", "Shopping", "Entertainment", "Utilities", "Other"]
): Promise<ParsedReceipt> => {
  if (!text || text.trim().length === 0) {
    throw new Error("No text extracted from receipt");
  }

  // Use AI for intelligent extraction
  const apiKey = getGeminiApiKey();
  const extracted: AIExtractedData = await extractReceiptDataWithAI(
    text,
    availableCategories,
    apiKey
  );

  const noteParts: string[] = [];
  if (extracted.merchant) {
    noteParts.push(`Merchant: ${extracted.merchant}`);
  }
  if (extracted.items && extracted.items.length > 0) {
    noteParts.push(`Items: ${extracted.items.slice(0, 3).join(", ")}`);
  }
  if (noteParts.length === 0) {
    noteParts.push(text.slice(0, 150));
  }

  return {
    user_id: userId,
    category: extracted.category,
    amount: extracted.amount,
    note: noteParts.join(" | "),
    created_at: extracted.date,
    merchant: extracted.merchant,
    confidence: extracted.confidence,
  };
};


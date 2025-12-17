import { addCategory } from "../api/category_api";
import { supabase } from "../api/supabase_client";
import { addTransaction, type Transaction } from "../api/transaction_api";


export const textFromApi = async (text: string): Promise<Transaction> => {
  const prompt = `
Extract transaction data from the text below.

RULES:
- return ONLY valid JSON
- category must be lowercase
- category must be short (1–2 words)
- if amount is missing, set it to 0

JSON FORMAT:
{
  "category": "",
  "amount": 0,
  "note": ""
}

TEXT:
${text}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    const parsed = JSON.parse(rawText) as Transaction;

 
    return {
      category: parsed.category?.toLowerCase() || "uncategorized",
      amount: parsed.amount ?? 0,
      note: parsed.note || text,
      user_id: parsed.user_id || "",
    };
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", err);
    return {
      category: "uncategorized",
      amount: 0,
      note: text,
      user_id: "",
    };
  }
};


export const addTransactionWithCategory = async (
  transaction: Transaction,
  userId: string
) => {

  const categoryName = transaction.category?.toLowerCase() || "uncategorized";

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, title")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch categories:", error);
    return;
  }

  const existingCategory = categories?.find(
    (cat) => cat.title.toLowerCase() === categoryName
  );

  let categoryId: string;

  if (existingCategory) {
    categoryId = existingCategory.id;
  } else {
    const newCategory = await addCategory(categoryName, userId);
    categoryId = newCategory.id;
  }

  transaction.user_id = userId;
  transaction.category = categoryName;

  await addTransaction(transaction);
};


export type SpendingInsight = {
  type: "warning" | "suggestion" | "info";
  message: string;
  category?: string;
};

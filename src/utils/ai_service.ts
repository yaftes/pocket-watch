
export type AIExtractedData = {
  amount: number;
  date: string;
  category: string;
  merchant?: string;
  items?: string[];
  confidence: number;
};

export type SpendingInsight = {
  type: "warning" | "suggestion" | "info";
  message: string;
  category?: string;
  amount?: number;
};


export const extractReceiptDataWithAI = async (
  receiptText: string,
  availableCategories: string[],
  apiKey?: string
): Promise<AIExtractedData> => {

  if (!apiKey) {
    return extractWithRegex(receiptText, availableCategories);
  }

  try {
    const prompt = `You are a financial data extraction assistant. Extract the following information from this receipt text:

Receipt Text:
${receiptText}

Available Categories: ${availableCategories.join(", ")}

Extract and return ONLY a valid JSON object with this exact structure:
{
  "amount": <number> (the total amount paid, must be a number),
  "date": "<YYYY-MM-DD>" (the transaction date, use today's date if not found: ${new Date().toISOString().split("T")[0]}),
  "category": "<category>" (must be one of: ${availableCategories.join(", ")}, choose the most appropriate),
  "merchant": "<merchant name>" (optional, the store/merchant name),
  "items": ["item1", "item2"] (optional, list of purchased items),
  "confidence": <0-1> (your confidence in the extraction, 0-1)
}

Rules:
- Amount must be a positive number
- Date must be in YYYY-MM-DD format
- Category MUST be one of the provided categories
- If category is unclear, use "Other"
- Confidence should reflect how certain you are (0.9+ for clear receipts, 0.5-0.8 for unclear)

Return ONLY the JSON object, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a precise financial data extraction assistant. Always return valid JSON only.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      throw new Error("No response from Gemini");
    }


    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const extracted = JSON.parse(jsonStr);


    return {
      amount: Math.abs(Number(extracted.amount) || 0),
      date: extracted.date || new Date().toISOString().split("T")[0],
      category:
        availableCategories.includes(extracted.category)
          ? extracted.category
          : "Other",
      merchant: extracted.merchant || undefined,
      items: Array.isArray(extracted.items) ? extracted.items : undefined,
      confidence: Math.min(1, Math.max(0, Number(extracted.confidence) || 0.5)),
    };
  } catch (error) {
    console.error("AI extraction failed, falling back to regex:", error);
    return extractWithRegex(receiptText, availableCategories);
  }
};


const extractWithRegex = (
  text: string,
  availableCategories: string[]
): AIExtractedData => {
  const amountPatterns = [
    /(?:total|amount|balance|sum|due)[\s:]*\$?\s*(\d+\.?\d{0,2})/gi,
    /\$(\d+\.?\d{0,2})/g,
    /(\d+\.\d{2})\s*(?:total|amount)/gi,
  ];

  let amount = 0;
  for (const pattern of amountPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      // Take the largest amount (usually the total)
      const amounts = matches.map((m) => parseFloat(m[1] || m[0]));
      amount = Math.max(...amounts);
      if (amount > 0) break;
    }
  }

  const datePatterns = [
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(?:date|on)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  ];

  let date = new Date().toISOString().split("T")[0];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const parsedDate = new Date(match[1]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split("T")[0];
          break;
        }
      } catch {
      }
    }
  }


  const categoryKeywords: Record<string, string[]> = {
    Food: ["restaurant", "cafe", "food", "grocery", "supermarket", "dining", "meal", "pizza", "burger", "coffee", "starbucks", "mcdonald"],
    Transport: ["gas", "fuel", "uber", "lyft", "taxi", "metro", "bus", "train", "parking", "toll", "transport"],
    Shopping: ["store", "shop", "retail", "amazon", "walmart", "target", "mall", "clothing", "apparel"],
    Entertainment: ["movie", "cinema", "theater", "netflix", "spotify", "game", "concert", "event", "ticket"],
    Utilities: ["electric", "water", "gas", "internet", "phone", "utility", "bill", "power", "electricity"],
  };

  let category = "Other";
  const lowerText = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (availableCategories.includes(cat)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }
  }

  return {
    amount,
    date,
    category,
    confidence: amount > 0 ? 0.7 : 0.3,
  };
};


export const getSpendingInsights = async (
  transactions: Array<{ amount: number; category: string; created_at: string }>,
  budgets: Array<{ category: string; amount: number; is_active: boolean }>,
  apiKey?: string
): Promise<SpendingInsight[]> => {
  const insights: SpendingInsight[] = [];

  // Calculate spending by category
  const spendingByCategory = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  budgets
    .filter((b) => b.is_active)
    .forEach((budget) => {
      const spent = spendingByCategory[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;

      if (percentage > 100) {
        insights.push({
          type: "warning",
          message: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}`,
          category: budget.category,
          amount: spent - budget.amount,
        });
      } else if (percentage > 80) {
        insights.push({
          type: "warning",
          message: `You're at ${percentage.toFixed(0)}% of your ${budget.category} budget`,
          category: budget.category,
        });
      }
    });

  const topCategory = Object.entries(spendingByCategory).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (topCategory && topCategory[1] > 0) {
    insights.push({
      type: "info",
      message: `Your top spending category is ${topCategory[0]} ($${topCategory[1].toFixed(2)})`,
      category: topCategory[0],
      amount: topCategory[1],
    });
  }

  if (apiKey && transactions.length > 5) {
    try {
      const aiInsights = await getAIInsights(
        transactions,
        budgets,
        apiKey
      );
      insights.push(...aiInsights);
    } catch (error) {
      console.error("Failed to get AI insights:", error);
    }
  }

  return insights.slice(0, 5); 
};


const getAIInsights = async (
  transactions: Array<{ amount: number; category: string; created_at: string }>,
  budgets: Array<{ category: string; amount: number; is_active: boolean }>,
  apiKey: string
): Promise<SpendingInsight[]> => {
  try {
    const prompt = `Analyze this spending data and provide 2-3 actionable insights:

Transactions: ${JSON.stringify(transactions.slice(0, 20))}
Budgets: ${JSON.stringify(budgets)}

Return a JSON array of insights with this structure:
[
  {
    "type": "warning" | "suggestion" | "info",
    "message": "<insight message>",
    "category": "<category>" (optional),
    "amount": <number> (optional)
  }
]

Focus on:
- Spending patterns
- Budget optimization suggestions
- Unusual spending spikes
- Category balance recommendations

Return ONLY the JSON array, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a financial advisor. Provide concise, actionable insights.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const jsonMatch = content?.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    if (jsonStr) {
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error("AI insights failed:", error);
  }

  return [];
};


export const getGeminiApiKey = (): string | undefined => {
  return import.meta.env.VITE_GEMINI_API_KEY || undefined;
};


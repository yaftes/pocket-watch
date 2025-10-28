
const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Other'];


const extractAmount = (text: string): number => {
  
  const amountRegex = /(total|amount|balance)?\s*[:$]?\s*(\d+(\.\d{1,2})?)/gi;
  let match;
  let lastAmount = 0;

  while ((match = amountRegex.exec(text)) !== null) {
    lastAmount = parseFloat(match[2]);
  }

  return lastAmount;
};


const extractDate = (text: string): string => {
  
  const dateRegex =
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const match = text.match(dateRegex);
  return match ? match[0] : new Date().toISOString().split('T')[0]; 
};


const extractCategory = (text: string): string => {
  for (const cat of categories) {
    if (text.toLowerCase().includes(cat.toLowerCase())) {
      return cat;
    }
  }
  return 'Other';
};


export const parseReceiptText = (text: string, userId: string) => {
  const amount = extractAmount(text);
  const date = extractDate(text);
  const category = extractCategory(text);

  return {
    user_id: userId,
    title: 'Receipt', 
    amount,
    category,
    type: 'expense' as const,
    date,
    notes: text, 
  };
};

import { supabase } from "./supabase_client";

export type Transaction = {
  id?: string;
  user_id?: string;
  category: string;
  amount: number;
  note?: string;
  budget_id?: string;
  created_at?: string;
};


export const getTransactions = async (
  userId: string,
  budgetId?: string,
  categoryName?: string
) => {
  let query = supabase
    .from("transactions")
    .select(`
      id,
      budget_id,
      category_id,
      amount,
      note,
      date,
      created_at,
      categories (title),
      budgets (amount, start_date, end_date)
    `)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (budgetId) query = query.eq("budget_id", budgetId);

  if (categoryName) {
    query = query.eq("categories.title", categoryName);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};


export const addTransaction = async (transaction: Transaction) => {

  const { data: categoryData, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", transaction.user_id)
    .eq("title", transaction.category)
    .single();

  if (catError || !categoryData) {
    throw new Error("Category not found.");
  }

  const categoryId = categoryData.id;

  const { data: activeBudget, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", transaction.user_id)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("end_date", { ascending: true })
    .limit(1)
    .single();

  if (budgetError || !activeBudget) {
    throw new Error("No active budget found for this category.");
  }

 
  const { data, error } = await supabase

    .from("transactions")
    .insert([
      {
        user_id: transaction.user_id,
        budget_id: activeBudget.id,
        category_id: categoryId,
        amount: transaction.amount,
        description: transaction.note || "",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;

};




export const updateTransaction = async (

  id: string,
  updatedData: Partial<{
    amount: number;
    note?: string;
    date?: string;
    category?: string;
  }>,
  userId: string
) => {
  let updatePayload: any = { ...updatedData };


  if (updatedData.category) {
    const { data: categoryData, error: catError } = await supabase

      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("title", updatedData.category)
      .single();

    if (catError || !categoryData) {
      throw new Error("Category not found.");
    }

    updatePayload.category_id = categoryData.id;

    const { data: activeBudget, error: budgetError } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("category_id", categoryData.id)
      .eq("is_active", true)
      .order("end_date", { ascending: true })
      .limit(1)
      .single();

    if (budgetError || !activeBudget) {
      throw new Error("No active budget found for the new category.");
    }

    updatePayload.budget_id = activeBudget.id;

    delete updatePayload.category;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};


export const deleteTransaction = async (id: string, userId: string) => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};

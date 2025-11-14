import type { Budget } from "./budget_api";
import { supabase } from "./supabase_client";
import type { Transaction } from "./transaction_api";

export type Category = {
  id?: string;
  title: string;
  user_id?: string;
  created_at?: string;
};

export type CategoryDetail = {
  category : Category,
  transactions : Transaction[],
  budgets : Budget[]
}

export type CategoryDashboardInfo = {
  id: string;
  title: string;
  total_budget_amount: number;
  is_there_active_budget: boolean;
  active_budget_amount?: number;
  active_budget_start_date?: string;
  active_budget_end_date?: string;
  budget_count: number;
  total_transactions_amount? : number,
  trasactions_count : number,
};




export const addCategory = async (title: string, userId: string) => {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ title, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};


export const deleteCategory = async (id: string,userId : string) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id).eq('user_id',userId);

  if (error) throw error;
  return true;
};


export const editCategory = async (category: Category) => {
  if (!category.id) throw new Error("Category ID required for update");

  const { data, error } = await supabase
    .from("categories")
    .update({ title: category.title })
    .eq("id", category.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};




export const getCategoriesDashboardInfo = async (userId: string) => {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (catError) throw catError;
  if (!categories) return [];

  const result: CategoryDashboardInfo[] = await Promise.all(
    categories.map(async (cat) => {
      const { data: budgets, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("category_id", cat.id)
        .eq("user_id", userId);

      if (budgetError) throw budgetError;

      const totalBudgetAmount = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0;
      const activeBudget = budgets?.find((b) => b.is_active);

      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("category_id", cat.id)
        .eq("user_id", userId);

      if (txError) throw txError;

      const totalTransactionsAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const transactionsCount = transactions?.length || 0;

      return {
        id: cat.id!,
        title: cat.title,
        total_budget_amount: totalBudgetAmount,
        is_there_active_budget: !!activeBudget,
        active_budget_amount: activeBudget?.amount || 0,
        active_budget_start_date: activeBudget?.start_date || "",
        active_budget_end_date: activeBudget?.end_date || "",
        budget_count: budgets?.length || 0,
        total_transactions_amount: totalTransactionsAmount,
        trasactions_count: transactionsCount,
      };
    })
  );

  return result;
};




export const getCategoryDetail = async (categoryId: string, userId: string): Promise<CategoryDetail> => {
  if (!categoryId || !userId) throw new Error("Category ID and User ID are required");

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .single();

  if (catError || !category) throw catError || new Error("Category not found");


  const { data: budgets, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("category_id", categoryId)
    .eq("user_id", userId);

  if (budgetError) throw budgetError;

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("category_id", categoryId)
    .eq("user_id", userId);

  if (txError) throw txError;

  return {
    category,
    budgets: budgets || [],
    transactions: transactions || [],
  };
};

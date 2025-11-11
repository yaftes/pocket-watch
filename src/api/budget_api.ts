import { supabase } from './supabase_client';


export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};


export const addBudget = async (
  user_id: string,
  category: string,
  budget: {
    start_date: string;
    end_date: string;
    amount: number;
  }
) => {

  const { data: existingBudgets, error: fetchError } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user_id)
    .eq("category", category)
    .order("end_date", { ascending: false });

  if (fetchError) throw fetchError;

  const today = new Date();
  const hasActiveBudget = existingBudgets?.some((b) => {
    const end = new Date(b.end_date);
    return today <= end;
  });

  if (hasActiveBudget) {
    throw new Error("You already have an active budget for this category.");
  }

  const { data: newBudget, error: insertError } = await supabase
    .from("budgets")
    .insert([
      {
        user_id,
        category,
        start_date: budget.start_date,
        end_date: budget.end_date,
        amount: budget.amount,
      },
    ])
    .select()
    .single();

  if (insertError) throw insertError;

  return newBudget;
};




export const updateBudget = async (id: string, updatedData: any) => {
  const { data, error } = await supabase
    .from('budgets')
    .update(updatedData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
};



export const deleteBudget = async (id: string) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

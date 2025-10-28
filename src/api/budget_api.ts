import { supabase } from './supabaseClient';


export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};


export const addBudget = async (budget: any) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([budget])
    .select();

  if (error) throw error;
  return data?.[0];
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

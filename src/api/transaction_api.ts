import { supabase } from './supabase_client';


export const getTransactions = async (userId: string) => {

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;

};


export const addTransaction = async (transaction: any) => {
    
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();

  if (error) throw error;
  return data?.[0];
  
};


export const updateTransaction = async (id: string, updatedData: any) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updatedData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
};


export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

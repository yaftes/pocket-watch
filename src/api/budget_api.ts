import { supabase } from './supabase_client';

export type Budget = {
  id?: string;
  user_id: string;
  category: string; 
  category_id?: string;
  amount: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  created_at?: string;
};




export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (title)
    `)
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
};


export const addBudget = async (
  user_id: string,
  category: string,
  budget: { start_date: string; end_date: string; amount: number }
) => {
  const { data: categoryData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user_id)
    .eq('title', category)
    .single();

  if (catError || !categoryData) {
    throw new Error('Category not found.');
  }

  const categoryId = categoryData.id;

  const { data: existingBudgets, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user_id)
    .eq('category_id', categoryId);

  if (fetchError) throw fetchError;

  const newStart = new Date(budget.start_date);
  const newEnd = new Date(budget.end_date);

  const hasOverlap = existingBudgets?.some((b) => {
    const start = new Date(b.start_date);
    const end = new Date(b.end_date);
    return newStart <= end && newEnd >= start;
  });

  if (hasOverlap) {
    throw new Error('Overlapping budget exists for this category.');
  }

  const { data: newBudget, error: insertError } = await supabase
    .from('budgets')
    .insert([
      {
        user_id,
        category_id: categoryId,
        amount: budget.amount,
        start_date: budget.start_date,
        end_date: budget.end_date,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (insertError) throw insertError;
  return newBudget;
};


export const updateBudget = async (
  id: string,
  user_id: string,
  updatedData: Partial<{ category: string; amount: number; start_date: string; end_date: string; is_active: boolean }>
) => {
  const updatePayload: any = { ...updatedData };

  if (updatedData.category) {
    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user_id)
      .eq('title', updatedData.category)
      .single();

    if (catError || !categoryData) {
      throw new Error('Category not found.');
    }
    updatePayload.category_id = categoryData.id;
    delete updatePayload.category;
  }

  if (updatePayload.start_date || updatePayload.end_date) {
    const { data: existingBudgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user_id)
      .neq('id', id)
      .eq('category_id', updatePayload.category_id || undefined);

    const newStart = new Date(updatePayload.start_date || '');
    const newEnd = new Date(updatePayload.end_date || '');

    const hasOverlap = existingBudgets?.some((b) => {
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      return newStart <= end && newEnd >= start;
    });

    if (hasOverlap) {
      throw new Error('Overlapping budget exists for this category.');
    }
  }

  
  const { data, error } = await supabase
    .from('budgets')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};




export const deleteBudget = async (id: string, user_id: string) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);

  if (error) throw error;
  return true;
};

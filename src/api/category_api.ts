import { supabase } from "./supabase_client";


export type Category = {
  id?: string;
  title: string;
  user_id?: string;
  created_at?: string;
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


export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

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


export const getCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

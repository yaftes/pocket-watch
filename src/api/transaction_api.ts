import { supabase } from "./supabase_client"


export type Transaction = {
  id?: string
  user_id: string
  budget_id: string
  category: string
  amount: number
  note?: string
  date: string
  created_at?: string
}


export const getTransactions = async (userId: string, budgetId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("budget_id", budgetId)
    .order("date", { ascending: false })

  if (error) throw error
  return data
}


export const addTransaction = async (transaction: Transaction) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: transaction.user_id,
        budget_id: transaction.budget_id,
        category: transaction.category,
        amount: transaction.amount,
        note: transaction.note || "",
        date: transaction.date,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}


export const updateTransaction = async (
  id: string,
  updatedData: Partial<Transaction>
) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(updatedData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}


export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from("transactions").delete().eq("id", id)
  if (error) throw error
  return true
}

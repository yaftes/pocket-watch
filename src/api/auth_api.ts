import { supabase } from "./supabase_client";

export const isLoggedIn = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getUser();
  return data.user !== null;
};


export const getUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user ? data.user.id : null;
};

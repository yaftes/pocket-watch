import { supabase } from "./supabase_client";




export const isLoggedIn = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getUser();
  return data.user !== null;
};


export const getUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user ? data.user.id : null;
};

export const getUserInfo = async () : Promise<string> => {
    const { data } = await supabase.auth.getUser();
    return data.user?.user_metadata.name;
}


export const signOut = async () => {
  return await supabase.auth.signOut();
}

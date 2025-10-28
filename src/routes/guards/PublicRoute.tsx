import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";

const PublicRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuth(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuth(!!session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;

  if (isAuth) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default PublicRoute;

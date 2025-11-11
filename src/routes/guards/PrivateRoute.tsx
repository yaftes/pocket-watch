import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase_client";
import { Spinner } from "../../components/ui/spinner";

const PrivateRoute = () => {

  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    
    supabase.auth.getSession().then(({ data }) => {
      setIsAuth(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuth(!!session);
    });
    
    return () => listener.subscription.unsubscribe();
  }, []);

  if (isAuth === null)
    return (
      
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    );
    
  if (!isAuth) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default PrivateRoute;

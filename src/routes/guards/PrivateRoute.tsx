import { Navigate, Outlet } from "react-router-dom";


const useAuth = () => {
  const user = localStorage.getItem("user"); 
  return user ? true : false;
};

const PrivateRoute = () => {
  const isAuth = useAuth();

  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  
  return <Outlet />;
};

export default PrivateRoute;

import PrivateRoute from "./guards/PrivateRoute";
import PublicRoute from "./guards/PublicRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CategoryDetail from "../pages/CategoryDetail";

import { Route, Routes } from "react-router-dom";
import Logout from "../pages/Logout";

const AppRoutes = () => {
  return (
    <Routes>
   
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

    
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/category/:id" element={<CategoryDetail />} />
      </Route>
      
      <Route path="/logout" element={<Logout />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;

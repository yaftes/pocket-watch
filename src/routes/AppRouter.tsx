
import PrivateRoute from "./guards/PrivateRoute";
import PublicRoute from "./guards/PublicRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import { Route, Routes } from "react-router-dom";


const AppRoutes = () => {
  return (

      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<PrivateRoute />}>
         <Route path="/dashboard" element={<Dashboard/>}/>
        </Route>
        <Route path="/" element={<Login />} />
      </Routes>

  );
};

export default AppRoutes;

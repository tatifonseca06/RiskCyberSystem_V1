import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import PublicRoute from "../auth/PublicRoute";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Activos from "../pages/Activos";
import Amenazas from "../pages/Amenazas";
import Vulnerabilidades from "../pages/Vulnerabilidades";
import Escenarios from "../pages/Escenarios";
import Analisis from "../pages/Analisis";
import MonteCarlo from "../pages/MonteCarlo";
import Tratamientos from "../pages/Tratamientos";
import Organizaciones from "../pages/Organizaciones";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas disponibles sin iniciar sesión */}
      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={<Login />}
        />
      </Route>

      {/* Rutas que requieren autenticación */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/activos"
            element={<Activos />}
          />

          <Route
            path="/amenazas"
            element={<Amenazas />}
          />

          <Route
            path="/vulnerabilidades"
            element={<Vulnerabilidades />}
          />

          <Route
            path="/escenarios"
            element={<Escenarios />}
          />

          <Route
            path="/analisis"
            element={<Analisis />}
          />

          <Route
            path="/monte-carlo"
            element={<MonteCarlo />}
          />

          <Route
            path="/tratamientos"
            element={<Tratamientos />}
          />

          <Route
            path="/organizaciones"
            element={<Organizaciones />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
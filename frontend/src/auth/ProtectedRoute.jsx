import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  const {
    isAuthenticated,
    isInitializing,
    hasRole,
  } = useAuth();

  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          sessionExpired: true,
        }}
      />
    );
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
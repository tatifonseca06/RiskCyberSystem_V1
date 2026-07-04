import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const restoreSession = useCallback(async () => {
    setIsInitializing(true);

    try {
      const session = await authService.restoreSession();

      if (session?.accessToken) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const session = await authService.login({
      username,
      password,
    });

    setUser(session.user);
    setIsAuthenticated(true);

    return session;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const hasRole = useCallback(
    (allowedRoles = []) => {
      if (!allowedRoles.length) {
        return true;
      }

      if (!user) {
        return false;
      }

      const userRole =
        user.role ??
        user.rol ??
        user.tipoUsuario ??
        user.tipo_usuario ??
        null;

      return allowedRoles.includes(userRole);
    },
    [user]
  );

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isInitializing,
      login,
      logout,
      restoreSession,
      hasRole,
    }),
    [
      user,
      isAuthenticated,
      isInitializing,
      login,
      logout,
      restoreSession,
      hasRole,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de un AuthProvider."
    );
  }

  return context;
};
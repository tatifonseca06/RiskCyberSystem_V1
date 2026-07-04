import axios from "axios";
import api from "./api";
import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
} from "../config/env";
import { authStorage } from "../utils/authStorage";
import {
  getUserFromToken,
  isTokenExpired,
} from "../utils/jwt";

const extractTokens = (responseData) => {
  const accessToken =
    responseData?.access ??
    responseData?.access_token ??
    responseData?.token ??
    responseData?.tokens?.access ??
    null;

  const refreshToken =
    responseData?.refresh ??
    responseData?.refresh_token ??
    responseData?.tokens?.refresh ??
    null;

  return {
    accessToken,
    refreshToken,
  };
};

const extractUser = (
  responseData,
  accessToken
) => {
  return (
    responseData?.user ??
    responseData?.usuario ??
    responseData?.data?.user ??
    getUserFromToken(accessToken)
  );
};

const isHtmlResponse = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue =
    value.trim().toLowerCase();

  return (
    normalizedValue.startsWith(
      "<!doctype html"
    ) ||
    normalizedValue.startsWith("<html")
  );
};

const getErrorMessage = (error) => {
  if (!error.response) {
    return (
      "No se pudo conectar con el servidor. " +
      "Verifica que Django esté ejecutándose."
    );
  }

  const statusCode =
    error.response.status;

  const responseData =
    error.response.data;

  if (statusCode === 404) {
    return (
      "No se encontró el endpoint de autenticación. " +
      "Verifica la URL configurada para el login."
    );
  }

  if (
    typeof responseData === "string" &&
    !isHtmlResponse(responseData)
  ) {
    return responseData;
  }

  if (responseData?.detail) {
    return responseData.detail;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (
    Array.isArray(
      responseData?.non_field_errors
    ) &&
    responseData.non_field_errors.length > 0
  ) {
    return responseData.non_field_errors[0];
  }

  if (
    Array.isArray(responseData?.username) &&
    responseData.username.length > 0
  ) {
    return responseData.username[0];
  }

  if (
    Array.isArray(responseData?.password) &&
    responseData.password.length > 0
  ) {
    return responseData.password[0];
  }

  if (statusCode === 400) {
    return (
      "Los datos enviados no son válidos. " +
      "Verifica el usuario y la contraseña."
    );
  }

  if (statusCode === 401) {
    return (
      "Usuario o contraseña incorrectos."
    );
  }

  if (statusCode === 403) {
    return (
      "No tienes permisos para acceder al sistema."
    );
  }

  if (statusCode >= 500) {
    return (
      "Ocurrió un error interno en el servidor."
    );
  }

  return (
    "No fue posible completar la solicitud."
  );
};

export const authService = {
  async login({ username, password }) {
    try {
      const response = await api.post(
        AUTH_ENDPOINTS.login,
        {
          username: username.trim(),
          password,
        }
      );

      const {
        accessToken,
        refreshToken,
      } = extractTokens(response.data);

      if (!accessToken) {
        throw new Error(
          "El backend respondió correctamente, " +
            "pero no devolvió el access token."
        );
      }

      const user = extractUser(
        response.data,
        accessToken
      );

      authStorage.setSession({
        accessToken,
        refreshToken,
        user,
      });

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      if (
        !error.response &&
        error.message?.includes(
          "no devolvió el access token"
        )
      ) {
        throw error;
      }

      throw new Error(
        getErrorMessage(error)
      );
    }
  },

  async restoreSession() {
    const accessToken =
      authStorage.getAccessToken();

    const refreshToken =
      authStorage.getRefreshToken();

    const storedUser =
      authStorage.getUser();

    if (!accessToken && !refreshToken) {
      return null;
    }

    if (
      accessToken &&
      !isTokenExpired(accessToken)
    ) {
      const user =
        storedUser ||
        getUserFromToken(accessToken);

      authStorage.setUser(user);

      return {
        accessToken,
        refreshToken,
        user,
      };
    }

    if (!refreshToken) {
      authStorage.clearSession();
      return null;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}${AUTH_ENDPOINTS.refresh}`,
        {
          refresh: refreshToken,
        },
        {
          timeout: 30000,
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
        }
      );

      const tokens = extractTokens(
        response.data
      );

      if (!tokens.accessToken) {
        authStorage.clearSession();
        return null;
      }

      const user =
        storedUser ||
        extractUser(
          response.data,
          tokens.accessToken
        );

      authStorage.setSession({
        accessToken:
          tokens.accessToken,

        refreshToken:
          tokens.refreshToken ||
          refreshToken,

        user,
      });

      return {
        accessToken:
          tokens.accessToken,

        refreshToken:
          tokens.refreshToken ||
          refreshToken,

        user,
      };
    } catch {
      authStorage.clearSession();
      return null;
    }
  },

  logout() {
    authStorage.clearSession();
  },

  getStoredUser() {
    return authStorage.getUser();
  },

  getAccessToken() {
    return authStorage.getAccessToken();
  },

  isAuthenticated() {
    const accessToken =
      authStorage.getAccessToken();

    return Boolean(
      accessToken &&
        !isTokenExpired(accessToken)
    );
  },
};
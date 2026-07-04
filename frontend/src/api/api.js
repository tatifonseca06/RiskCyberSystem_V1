import axios from "axios";
import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
} from "../config/env";
import { authStorage } from "../utils/authStorage";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let refreshPromise = null;

const isAuthenticationEndpoint = (url = "") => {
  return (
    url.includes(AUTH_ENDPOINTS.login) ||
    url.includes(AUTH_ENDPOINTS.refresh)
  );
};

const requestNewAccessToken = async () => {
  const refreshToken =
    authStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "No existe un refresh token disponible."
    );
  }

  const response = await axios.post(
    `${API_BASE_URL}${AUTH_ENDPOINTS.refresh}`,
    {
      refresh: refreshToken,
    },
    {
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const newAccessToken =
    response.data?.access ??
    response.data?.access_token ??
    response.data?.tokens?.access ??
    null;

  const newRefreshToken =
    response.data?.refresh ??
    response.data?.refresh_token ??
    response.data?.tokens?.refresh ??
    null;

  if (!newAccessToken) {
    throw new Error(
      "El backend no devolvió un nuevo access token."
    );
  }

  authStorage.setAccessToken(newAccessToken);

  if (newRefreshToken) {
    authStorage.setRefreshToken(newRefreshToken);
  }

  return newAccessToken;
};

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise =
      requestNewAccessToken().finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    const accessToken =
      authStorage.getAccessToken();

    if (
      accessToken &&
      !isAuthenticationEndpoint(config.url)
    ) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;

    if (
      statusCode !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthenticationEndpoint(
        originalRequest.url
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken =
        await refreshAccessToken();

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      authStorage.clearSession();

      window.dispatchEvent(
        new CustomEvent(
          "auth:session-expired"
        )
      );

      return Promise.reject(refreshError);
    }
  }
);

export default api;
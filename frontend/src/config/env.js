const removeTrailingSlash = (value = "") => {
  return value.replace(/\/+$/, "");
};

const ensureLeadingSlash = (value = "") => {
  if (!value) {
    return "";
  }

  return value.startsWith("/") ? value : `/${value}`;
};

export const API_BASE_URL = removeTrailingSlash(
  import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api"
);

export const AUTH_ENDPOINTS = {
  login: ensureLeadingSlash(
    import.meta.env.VITE_AUTH_LOGIN_ENDPOINT ||
      "/login/"
  ),

  refresh: ensureLeadingSlash(
    import.meta.env.VITE_AUTH_REFRESH_ENDPOINT ||
      "/token/refresh/"
  ),
};
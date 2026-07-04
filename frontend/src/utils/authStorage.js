const ACCESS_TOKEN_KEY = "riskcyber_access_token";
const REFRESH_TOKEN_KEY = "riskcyber_refresh_token";
const USER_KEY = "riskcyber_authenticated_user";

const isBrowser = typeof window !== "undefined";

const safeParseJSON = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const authStorage = {
  getAccessToken() {
    if (!isBrowser) {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token) {
    if (!isBrowser) {
      return;
    }

    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  getRefreshToken() {
    if (!isBrowser) {
      return null;
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token) {
    if (!isBrowser) {
      return;
    }

    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  getUser() {
    if (!isBrowser) {
      return null;
    }

    return safeParseJSON(localStorage.getItem(USER_KEY));
  },

  setUser(user) {
    if (!isBrowser) {
      return;
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  setSession({ accessToken, refreshToken, user }) {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    this.setUser(user);
  },

  clearSession() {
    if (!isBrowser) {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
const decodeBase64Url = (value) => {
  try {
    const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");

    const paddedValue = normalizedValue.padEnd(
      normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
      "="
    );

    const decodedValue = atob(paddedValue);

    const bytes = decodedValue
      .split("")
      .map((character) => {
        return `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`;
      })
      .join("");

    return decodeURIComponent(bytes);
  } catch {
    return null;
  }
};

export const decodeJwt = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    return null;
  }

  const decodedPayload = decodeBase64Url(tokenParts[1]);

  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token, expirationMarginSeconds = 15) => {
  const payload = decodeJwt(token);

  if (!payload?.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  return payload.exp <= currentTime + expirationMarginSeconds;
};

export const getUserFromToken = (token) => {
  const payload = decodeJwt(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.user_id ?? payload.id ?? payload.sub ?? null,
    username:
      payload.username ??
      payload.user_name ??
      payload.preferred_username ??
      payload.email ??
      "Usuario",
    email: payload.email ?? "",
    firstName: payload.first_name ?? payload.firstName ?? "",
    lastName: payload.last_name ?? payload.lastName ?? "",
    role: payload.role ?? payload.rol ?? payload.user_role ?? null,
    isStaff: payload.is_staff ?? false,
    isSuperuser: payload.is_superuser ?? false,
    tokenPayload: payload,
  };
};
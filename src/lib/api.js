const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

const getStoredToken = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null")?.token || null;
  } catch {
    return null;
  }
};

const buildAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && data.code === "TOKEN_EXPIRED") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

export const apiGet = (path) => apiRequest(path);

export const apiPost = (path, body) => apiRequest(path, {
  method: "POST",
  body: JSON.stringify(body ?? {}),
});

export const apiPatch = (path, body) => apiRequest(path, {
  method: "PATCH",
  body: JSON.stringify(body ?? {}),
});

export const apiDelete = (path) => apiRequest(path, {
  method: "DELETE",
});

export const apiUpload = async (path, formData, method = "POST") => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...buildAuthHeaders(),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && data.code === "TOKEN_EXPIRED") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    throw new Error(data.message || data.error || "Upload failed");
  }

  return data;
};

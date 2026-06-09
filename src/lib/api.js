const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
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

export const apiUpload = async (path, formData, method = "POST") => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Upload failed");
  }

  return data;
};

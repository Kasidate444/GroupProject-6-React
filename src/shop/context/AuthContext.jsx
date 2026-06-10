import { createContext, useContext, useState, useEffect } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { socket } from "../../lib/socket";

const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

const buildRegisterRequest = (userData = {}) => {
  if (userData.role === "artist") {
    return {
      path: "/auth/register/artist",
      body: {
        display_name: userData.artistName,
        username: userData.username,
        email: userData.email,
        genre: userData.genre,
        password: userData.password,
      },
    };
  }

  return {
    path: "/auth/register/fan",
    body: {
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      password: userData.password,
    },
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await apiGet("/auth/me");
        const session = { ...response.data, loggedIn: true };

        if (!cancelled) {
          localStorage.setItem("session", JSON.stringify(session));
          setUser(session);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("session");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password }) => {
    const response = await apiPost("/auth/login", { email, password });
    const session = { ...response.user, loggedIn: true };

    localStorage.setItem("session", JSON.stringify(session));
    setUser(session);

    socket.disconnect();

    return session;
  };

  const register = async (userData) => {
    const { path, body } = buildRegisterRequest(userData);
    return apiPost(path, body);
  };

  const logout = async () => {
    try {
      await apiPost("/logout");
    } catch {
      // Clear local state even if the server-side cookie is already gone.
    }

    localStorage.removeItem("session");
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn: !!user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

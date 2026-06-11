import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getStoredToken = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null")?.token || null;
  } catch {
    return null;
  }
};

export const socket = io(socketUrl, {
  auth: (callback) => {
    callback({ token: getStoredToken() });
  },
  autoConnect: false,
});

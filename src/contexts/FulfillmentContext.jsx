/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "audjlist_fulfillment";

const FulfillmentContext = createContext(null);

export function FulfillmentProvider({ children }) {
  const [overrides, setOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  // Write to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  // Listen for changes from OTHER tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setOverrides(JSON.parse(e.newValue));
        } catch {
          // Ignore malformed storage events from other tabs.
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setStatus = (orderId, productId, status) =>
    setOverrides((prev) => ({ ...prev, [`${orderId}::${productId}`]: status }));

  const getStatus = (orderId, productId, fallback) =>
    overrides[`${orderId}::${productId}`] ?? fallback;

  return (
    <FulfillmentContext.Provider value={{ overrides, setStatus, getStatus }}>
      {children}
    </FulfillmentContext.Provider>
  );
}

export const useFulfillment = () => useContext(FulfillmentContext);

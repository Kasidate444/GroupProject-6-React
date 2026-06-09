/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";

const WishlistContext = createContext(null);

const persistWishlist = (next) => {
  localStorage.setItem("wishlist", JSON.stringify([...next]));
  return next;
};

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const setWishlistedProducts = useCallback((productIds = []) => {
    setIds(persistWishlist(new Set(productIds.filter(Boolean))));
  }, []);

  const setLocalWishlist = useCallback((productId, wishlisted) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (wishlisted) next.add(productId);
      else next.delete(productId);
      return persistWishlist(next);
    });
  }, []);

  const toggleWishlist = useCallback(async (productId) => {
    if (!productId) return;

    let wasWishlisted = false;
    setIds((prev) => {
      wasWishlisted = prev.has(productId);
      const next = new Set(prev);
      if (wasWishlisted) next.delete(productId);
      else next.add(productId);
      return persistWishlist(next);
    });

    try {
      const result = await apiRequest(`/products/${productId}/wishlist`, { method: "PATCH" });
      if (typeof result.wishlisted === "boolean") {
        setLocalWishlist(productId, result.wishlisted);
      }
    } catch (error) {
      setLocalWishlist(productId, wasWishlisted);
      throw error;
    }
  }, [setLocalWishlist]);

  const value = useMemo(() => ({
    toggleWishlist,
    isWishlisted: (productId) => ids.has(productId),
    wishlistedIds: [...ids],
    setWishlistedProducts,
  }), [ids, setWishlistedProducts, toggleWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
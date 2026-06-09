/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { apiRequest } from "../../lib/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const persist = (next) => {
    localStorage.setItem("wishlist", JSON.stringify([...next]));
    return next;
  };

  const setWishlistedProducts = (productIds = []) => {
    setIds(persist(new Set(productIds.filter(Boolean))));
  };

  const setLocalWishlist = (productId, wishlisted) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (wishlisted) next.add(productId);
      else next.delete(productId);
      return persist(next);
    });
  };

  const toggleWishlist = async (productId) => {
    if (!productId) return;
    const wasWishlisted = ids.has(productId);
    setLocalWishlist(productId, !wasWishlisted);

    try {
      const result = await apiRequest(`/products/${productId}/wishlist`, { method: "PATCH" });
      if (typeof result.wishlisted === "boolean") {
        setLocalWishlist(productId, result.wishlisted);
      }
    } catch (error) {
      setLocalWishlist(productId, wasWishlisted);
      throw error;
    }
  };

  const isWishlisted = (productId) => ids.has(productId);
  const wishlistedIds = [...ids];

  return (
    <WishlistContext.Provider value={{ toggleWishlist, isWishlisted, wishlistedIds, setWishlistedProducts }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

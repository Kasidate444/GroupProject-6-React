import { createContext, useCallback, useContext, useState } from "react";
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

  const setLocalWishlist = (productId, wishlisted) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (wishlisted) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      localStorage.setItem("wishlist", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleWishlist = async (productId) => {
    const nextWishlisted = !ids.has(productId);
    setLocalWishlist(productId, nextWishlisted);

    try {
      const result = await apiRequest(`/products/${productId}/wishlist`, { method: "PATCH" });
      if (typeof result.wishlisted === "boolean") {
        setLocalWishlist(productId, result.wishlisted);
      }
    } catch (err) {
      setLocalWishlist(productId, !nextWishlisted);
      throw err;
    }
  };

  const isWishlisted = (productId) => ids.has(productId);

  const wishlistedIds = [...ids];
  const setWishlistedProducts = useCallback((productIds = []) => {
    const next = new Set(productIds.filter(Boolean));
    localStorage.setItem("wishlist", JSON.stringify([...next]));
    setIds(next);
  }, []);

  return (
    <WishlistContext.Provider value={{ toggleWishlist, isWishlisted, wishlistedIds, setWishlistedProducts }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

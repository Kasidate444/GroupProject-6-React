import { createContext, useContext, useState } from "react";

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

  const toggleWishlist = (productId) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      localStorage.setItem("wishlist", JSON.stringify([...next]));
      return next;
    });
  };

  const isWishlisted = (productId) => ids.has(productId);

  const wishlistedIds = [...ids];

  return (
    <WishlistContext.Provider value={{ toggleWishlist, isWishlisted, wishlistedIds }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

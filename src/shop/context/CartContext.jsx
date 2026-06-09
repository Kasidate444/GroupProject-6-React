import { createContext, useContext, useState } from "react";
import { findArtistById } from "../data/helpers";
import { FIXED_SHIPPING_THB } from "../data/constants";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const addToCart = (product, options = {}) => {
    const { quantity = 1, unitPrice = product.price, variantId = null } = options;
    const key = `${product._id}-${variantId || "none"}-${unitPrice}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          key,
          product_id: product._id,
          artist_id: product.artist_id,
          title_snapshot: product.title,
          artist_name_snapshot: findArtistById(product.artist_id)?.name || "Unknown",
          unit_price: unitPrice,
          quantity,
          variant_id: variantId,
          cover_url: product.cover_url,
          type: product.type,
        },
      ];
    });
    setOpen(true);
  };

  const removeItem = (key) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const updateQty = (key, quantity) => {
    if (quantity < 1) { removeItem(key); return; }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const hasPhysicalItems = items.some((i) => i.type === "merch");
  const shippingCost = hasPhysicalItems ? FIXED_SHIPPING_THB : 0;
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        items, open, setOpen,
        addToCart, removeItem, updateQty, clearCart,
        totalItems, total,shippingCost
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

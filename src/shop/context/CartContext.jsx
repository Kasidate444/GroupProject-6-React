/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { FIXED_SHIPPING_THB } from "../data/constants";

export const CartContext = createContext(null);

const isDigitalProduct = (type) => type === "single" || type === "album";

const getArtistNameSnapshot = (product) => (
  product.artist?.name || product.artist?.display_name || product.artist?.username || "Unknown"
);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const addToCart = (product, options = {}) => {
    const { quantity = 1, unitPrice = product.price, variantId = null } = options;
    const digital = isDigitalProduct(product.type);
    const nextQuantity = digital ? 1 : quantity;
    const key = `${product._id}-${variantId || "none"}-${unitPrice}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) => (
          item.key === key ? { ...item, quantity: digital ? 1 : item.quantity + nextQuantity } : item
        ));
      }

      return [
        ...prev,
        {
          key,
          product_id: product._id,
          artist_id: product.artist_id,
          title_snapshot: product.title,
          artist_name_snapshot: getArtistNameSnapshot(product),
          unit_price: unitPrice,
          quantity: nextQuantity,
          variant_id: variantId,
          cover_url: product.cover_url,
          type: product.type,
        },
      ];
    });
    setOpen(true);
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQty = (key, quantity) => {
    if (quantity < 1) {
      removeItem(key);
      return;
    }

    setItems((prev) => prev.map((item) => (
      item.key === key ? { ...item, quantity: isDigitalProduct(item.type) ? 1 : quantity } : item
    )));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const hasPhysicalItems = items.some((item) => item.type === "merch");
  const shippingCost = hasPhysicalItems ? FIXED_SHIPPING_THB : 0;
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addToCart,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        total,
        shippingCost,
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
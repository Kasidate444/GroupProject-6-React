/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { FIXED_SHIPPING_THB } from "../data/constants";
import { getProductTracks } from "../utils/productShape";

export const CartContext = createContext(null);

const isDigitalProduct = (type) => type === "single" || type === "album";
const MAX_CART_QUANTITY = 9999;

const getArtistNameSnapshot = (product) => (
  product.artist?.name || product.artist?.display_name || product.artist?.username || "Unknown"
);

const getDownloadTracks = (product) => (
  getProductTracks(product)
    .map((track, index) => ({
      _id: track._id || `${product._id}-track-${index + 1}`,
      title: track.title || product.title || `Track ${index + 1}`,
      audio_file_url: track.audio_file_url || track.audio_url?.url || track.audioUrl?.url || null,
      preview_url: track.preview_url || null,
    }))
    .filter((track) => track.audio_file_url)
);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const addToCart = (product, options = {}) => {
    const { quantity = 1, unitPrice = product.price, variantId = null } = options;
    const digital = isDigitalProduct(product.type);
    const nextQuantity = digital ? 1 : Math.min(Math.max(Number(quantity) || 1, 1), MAX_CART_QUANTITY);
    const key = `${product._id}-${variantId || "none"}-${unitPrice}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) => (
          item.key === key ? { ...item, quantity: digital ? 1 : Math.min(item.quantity + nextQuantity, MAX_CART_QUANTITY) } : item
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
          download_tracks: digital ? getDownloadTracks(product) : [],
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
      item.key === key ? { ...item, quantity: isDigitalProduct(item.type) ? 1 : Math.min(quantity, MAX_CART_QUANTITY) } : item
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

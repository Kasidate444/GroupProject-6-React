import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../../hooks/useAuth";
import { formatPrice, findProductById, getArtistGenres } from "../../data/helpers";

export default function CartDrawer() {
  const {
    items,
    open,
    setOpen,
    removeItem,
    updateQty,
    clearCart,
    total,
    shippingCost
  } = useCart();

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setOpen(false);
    if (!isLoggedIn) {
      sessionStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-bg border-l border-white/[0.05] z-50 flex flex-col transition-transform duration-300 sm:w-105 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h2 className="text-white/90 font-semibold text-[16px]">
              Shopping Cart
            </h2>
            {items.length > 0 && (
              <span className="bg-accent text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-5 text-center">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/35 hover:text-white/70 transition-colors text-xl leading-none"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-white/25 text-[14px]">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.key}
                  item={item}
                  onRemove={() => removeItem(item.key)}
                  onUpdateQty={(q) => updateQty(item.key, q)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/[0.05] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[13px]">Shipping Fee: {`${shippingCost}`}</span>
              <span className="text-white/50 text-[13px]">Total</span>
              <span className="text-white font-bold text-[20px]">
                {formatPrice(total)}
              </span>
            </div>

            <button onClick={handleCheckout} className="w-full bg-accent hover:bg-accent-hover text-white font-semibold text-[15px] py-3 rounded-lg transition-colors active:scale-[0.99]">
              {isLoggedIn ? "Checkout" : "Log in and Checkout"}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-white/35 hover:text-[rgba(255,80,110,0.65)] text-[12px] transition-colors underline-offset-2 hover:underline"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sub-component: Single cart item ───
function CartItem({ item, onRemove, onUpdateQty }) {
  const [expanded, setExpanded] = useState(false);
  const product = findProductById(item.product_id);
  const genres = getArtistGenres(item.artist_id);
  const isDigital = item.type === "single" || item.type === "album";
  const productPath = `/product/${item.product_slug || product?.slug || item.product_id}`;

  return (
    <div className="rounded-xl bg-white/4 border border-white/[0.05] overflow-hidden">
      {/* Main row */}
      <div className="relative p-3">
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 text-white/25 hover:text-[rgba(255,80,110,0.7)] transition-colors text-sm leading-none"
          aria-label="Remove"
        >
          ✕
        </button>

        <div className="flex gap-3">
          <button onClick={() => setExpanded((v) => !v)} className="shrink-0">
            <div className="w-[67px] h-[67px] rounded-lg overflow-hidden bg-bg-card">
              {item.cover_url ? (
                <img
                  src={item.cover_url}
                  alt={item.title_snapshot}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">
                  ◈
                </div>
              )}
            </div>
          </button>

          <div className="flex-1 min-w-0 pr-5">
            <p className="text-white/88 font-semibold text-[15px] truncate">
              {item.title_snapshot}
            </p>
            <p className="text-white/45 text-[13px] truncate">
              by {item.artist_name_snapshot}
            </p>
            <p className="text-white/30 text-[12px] truncate">
              {item.type}
            </p>

            <div className="flex items-center justify-between mt-2">
              {isDigital ? (
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Qty 1
                </span>
              ) : (
                <div className="flex items-center rounded-md overflow-hidden border border-white/10 bg-white/5">
                  <button
                    onClick={() => onUpdateQty(item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-white/85 font-semibold text-[13px]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              )}
              <p className="text-white/85 font-semibold text-[15px]">
                {formatPrice(item.unit_price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Type + genres / price */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                {item.type}
              </span>
              {genres.map((g) => (
                <span key={g._id} className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                  {g.name}
                </span>
              ))}
            </div>
            <span className="text-white font-bold text-[16px] whitespace-nowrap">
              {formatPrice(item.unit_price)}
            </span>
          </div>

          {/* Description */}
          {product?.description && (
            <p className="text-white/45 text-[12px] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Link
              to={productPath}
              className="flex-1 text-center py-2 rounded-full bg-white text-bg text-[12px] font-semibold no-underline hover:bg-white/90 transition-colors"
            >
              View product
            </Link>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border border-white/15 text-white/60 text-[12px] font-medium hover:border-white/30 hover:text-white/85 transition-all">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Wishlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

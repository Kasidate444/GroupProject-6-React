import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useWishlist } from "../../context/WishlistContext";
import { MERCH_TYPE_ICONS, CATEGORIES } from "../../data/constants";
import {
  formatPrice,
  findMerchByProductId,
  findTrackByProductId,
  findAlbumByProductId,
  findTrackById,
  getArtistGenres,
} from "../../data/helpers";

export default function ProductCard({ product, contextQueue }) {
  const { addToCart } = useCart();
  const {
    isProductPlaying,
    currentProduct,
    togglePlay,
    playProduct,
  } = useAudioPlayer();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [flashed, setFlashed] = useState(false);
  const [burst, setBurst] = useState(false);
  const [burstPos, setBurstPos] = useState({ top: '50%', left: '50%' });
  const cardRef = useRef(null);
  const wishBtnRef = useRef(null);
  const wishlisted = isWishlisted(product._id);

  const isPlaying = isProductPlaying(product._id);
  const genres = product.artist ? getArtistGenres(product.artist._id) : [];

  // เล่นได้เฉพาะ single และ album — merch ไม่มี
  const track = product.type === "album"
    ? (() => { const album = findAlbumByProductId(product._id); return album?.track_ids?.[0] ? findTrackById(album.track_ids[0]) : null; })()
    : findTrackByProductId(product._id);
  const canPlay = !!(track && track.audio_file_url);

  // Badge label + icon
  const typeBadge = (() => {
    if (product.type === "merch") {
      const m = findMerchByProductId(product._id);
      const cat = CATEGORIES.find((c) => c.key === m?.merch_type);
      return {
        icon: MERCH_TYPE_ICONS[m?.merch_type] || "◈",
        label: cat?.label || "Merch",
      };
    }
    return {
      icon: "♪",
      label: product.type === "album" ? "Album" : "Single",
    };
  })();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, { quantity: 1, unitPrice: product.price });
    setFlashed(true);
    setTimeout(() => setFlashed(false), 1400);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wishlisted && cardRef.current && wishBtnRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const btnRect = wishBtnRef.current.getBoundingClientRect();
      const top = btnRect.top - cardRect.top + btnRect.height / 2;
      const left = btnRect.left - cardRect.left + btnRect.width / 2;
      setBurstPos({ top: `${top}px`, left: `${left}px` });
      setBurst(true);
      setTimeout(() => setBurst(false), 1800);
    }
    toggleWishlist(product._id);
  };

  // ── ปุ่ม Preview → bottom player ตัวเดียว (toggle ถ้าเล่นตัวนี้อยู่) ──
  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPlay) return;
    if (currentProduct?._id === product._id) {
      togglePlay();
    } else {
      playProduct(product, contextQueue);
    }
  };

  // ── Heart icon — music heart when wishlisted ──
  const HeartIcon = ({ size = 14, filled }) => (
    <span className={`relative inline-flex items-center justify-center transition-all duration-300 ${filled ? "scale-[1.4]" : "scale-100"}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? "#fc3c44" : "none"}
        stroke={filled ? "#fc3c44" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={filled ? "drop-shadow-[0_0_8px_rgba(252,60,68,0.7)]" : ""}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {filled && (
        <span className="absolute text-white font-bold leading-none pointer-events-none"
          style={{ fontSize: size * 0.55, marginTop: size * 0.1 }}>
          ♪
        </span>
      )}
    </span>
  );

  return (
    <Link
      to={`/product/${product.slug}`}
      ref={cardRef}
      className="group relative flex flex-col gap-2 no-underline rounded-xl transition-all duration-200 hover:ring-1 hover:ring-white/15 hover:ring-offset-1 hover:ring-offset-bg"
    >
      {/* ── Burst particles — ต้องอยู่นอก overflow-hidden ── */}
      {burst && [
        { n: "♪", tx: "-50px", ty: "-55px", rot: "-30deg", delay: 0 },
        { n: "🎵", tx: "55px", ty: "-50px", rot: "20deg", delay: 50 },
        { n: "♫", tx: "-60px", ty: "10px", rot: "-45deg", delay: 30 },
        { n: "🎶", tx: "60px", ty: "15px", rot: "35deg", delay: 80 },
        { n: "♩", tx: "0px", ty: "-65px", rot: "-20deg", delay: 20 },
        { n: "🎵", tx: "-30px", ty: "60px", rot: "50deg", delay: 60 },
        { n: "♪", tx: "40px", ty: "-60px", rot: "-10deg", delay: 40 },
        { n: "♫", tx: "55px", ty: "55px", rot: "40deg", delay: 70 },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute text-[13px] pointer-events-none animate-[music-burst_1.8s_cubic-bezier(0.1,0.8,0.2,1)_forwards]"
          style={{
            '--tx': p.tx, '--ty': p.ty, '--rot': p.rot,
            animationDelay: `${p.delay}ms`,
            zIndex: 999,
            top: burstPos.top, left: burstPos.left,
          }}
        >{p.n}</span>
      ))}

      {/* ── Cover ── */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
        <img
          src={product.cover_url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Action bar (hover) */}
        <div className="absolute bottom-0 inset-x-0 flex items-stretch translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-[rgba(20,20,22,0.95)] backdrop-blur-sm border-t border-white/8 divide-x divide-white/8">
          {canPlay ? (
            <>
              {/* Preview — ปุ่มหลัก กว้างสุด */}
              <button
                onClick={handlePlay}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${
                  isPlaying ? "bg-accent text-white" : "text-white/70 hover:bg-accent hover:text-white"
                }`}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "1px" }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {isPlaying ? "Playing" : "Preview"}
              </button>
              {/* Wishlist — ไอคอน */}
              <button
                ref={wishBtnRef}
                onClick={handleWishlist}
                className={`relative flex items-center justify-center px-3 py-2.5 transition-all duration-200 ${
                  wishlisted
                    ? "text-accent scale-110"
                    : "text-white/70 hover:text-accent hover:scale-110"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlisted && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-accent/20 pointer-events-none" />
                )}
                <HeartIcon filled={wishlisted} />
              </button>
              {/* Add to cart — ไอคอน */}
              <button
                onClick={handleQuickAdd}
                className={`flex items-center justify-center px-3 py-2.5 transition-all ${
                  flashed ? "bg-accent text-white" : "text-white/70 hover:bg-accent hover:text-white"
                }`}
                aria-label="Add to cart"
              >
                {flashed ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <>
              {/* merch — wishlist + add to cart */}
              <button
                ref={wishBtnRef}
                onClick={handleWishlist}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${
                  wishlisted ? "text-accent" : "text-white/70 hover:text-accent"
                }`}
              >
                <HeartIcon filled={wishlisted} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={handleQuickAdd}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${
                  flashed ? "bg-accent text-white" : "text-white/70 hover:bg-accent hover:text-white"
                }`}
              >
                {flashed ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Add to cart
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* NYP badge */}
        {product.name_your_price && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-purple text-white">
            Pay what you want
          </span>
        )}

        {/* Type badge */}
        <span className="absolute top-1.5 right-1.5 bg-[rgba(28,28,30,0.75)] backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded text-[12px] text-white/65 font-medium flex items-center gap-1">
          <span>{typeBadge.icon}</span>
          {typeBadge.label}
        </span>
      </div>

      {/* ── Text ── */}
      <div className="px-[5%] pb-1">
        <h3 className="font-semibold text-white/88 text-[14px] leading-snug truncate group-hover:text-white transition-colors">
          {product.title}
        </h3>
        <p className="text-white/45 text-[12px] truncate">
          by{" "}
          {product.artist?.slug ? (
            <Link
              to={`/artist/${product.artist.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white/75 transition-colors"
            >
              {product.artist.name}
            </Link>
          ) : (
            product.artist?.name || "Unknown"
          )}
        </p>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.slice(0, 2).map((g) => (
              <span
                key={g._id}
                className="px-1.5 py-0.5 rounded text-[10px] text-white/50 bg-white/[0.07] leading-none"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-white/85 text-[14px] font-semibold whitespace-nowrap">
            {product.name_your_price ? "from " : ""}
            {formatPrice(product.price)}
          </span>
          {/* หัวใจมุมราคา — แสดงสถานะตลอดเวลา (ไม่ต้อง hover) */}
          {wishlisted && <HeartIcon size={18} filled />}
        </div>
      </div>
    </Link>
  );
}

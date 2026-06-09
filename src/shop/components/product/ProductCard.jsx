import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice } from "../../data/helpers";
import {
  canPreviewProduct,
  getArtistName,
  getArtistSlug,
  getProductGenres,
  getProductMerchType,
} from "../../utils/productShape";

const MERCH_LABELS = {
  tshirt: "T-shirt",
  vinyl: "Vinyl",
  cd: "Compact disc",
  cassette: "Cassette",
  poster: "Poster",
  snapback: "Snapback",
  tote: "Tote bag",
};

const MERCH_ICONS = {
  tshirt: "\u2726",
  vinyl: "\u25D0",
  cd: "CD",
  cassette: "CS",
  poster: "P",
  snapback: "C",
  tote: "T",
};

function ProductHeartIcon({ size = 14, filled }) {
  return (
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
        <span className="absolute text-white font-bold leading-none pointer-events-none" style={{ fontSize: size * 0.55, marginTop: size * 0.1 }}>
          {"\u266A"}
        </span>
      )}
    </span>
  );
}

export default function ProductCard({ product, contextQueue }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isProductPlaying, currentProduct, togglePlay, playProduct } = useAudioPlayer();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [flashed, setFlashed] = useState(false);
  const [burst, setBurst] = useState(false);
  const [burstPos, setBurstPos] = useState({ top: "50%", left: "50%" });
  const cardRef = useRef(null);
  const wishBtnRef = useRef(null);

  const wishlisted = isWishlisted(product._id);
  const isPlaying = isProductPlaying(product._id);
  const genres = getProductGenres(product);
  const canPlay = canPreviewProduct(product);
  const artistSlug = getArtistSlug(product);
  const artistName = getArtistName(product);

  const typeBadge = (() => {
    if (product.type === "merch") {
      const merchType = getProductMerchType(product);
      return {
        icon: MERCH_ICONS[merchType] || "\u2726",
        label: MERCH_LABELS[merchType] || "Merch",
      };
    }

    return {
      icon: "\u266A",
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

  const burstParticles = [
    { n: "\u266A", tx: "-50px", ty: "-55px", rot: "-30deg", delay: 0 },
    { n: "\uD83C\uDFB5", tx: "55px", ty: "-50px", rot: "20deg", delay: 50 },
    { n: "\u266B", tx: "-60px", ty: "10px", rot: "-45deg", delay: 30 },
    { n: "\uD83C\uDFB6", tx: "60px", ty: "15px", rot: "35deg", delay: 80 },
    { n: "\u2669", tx: "0px", ty: "-65px", rot: "-20deg", delay: 20 },
    { n: "\uD83C\uDFB5", tx: "-30px", ty: "60px", rot: "50deg", delay: 60 },
    { n: "\u266A", tx: "40px", ty: "-60px", rot: "-10deg", delay: 40 },
    { n: "\u266B", tx: "55px", ty: "55px", rot: "40deg", delay: 70 },
  ];

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      ref={cardRef}
      className="group relative flex flex-col gap-2 no-underline rounded-xl transition-all duration-200 hover:ring-1 hover:ring-white/15 hover:ring-offset-1 hover:ring-offset-bg"
    >
      {burst && burstParticles.map((particle, index) => (
        <span
          key={index}
          className="absolute text-[13px] pointer-events-none animate-[music-burst_1.8s_cubic-bezier(0.1,0.8,0.2,1)_forwards]"
          style={{
            "--tx": particle.tx,
            "--ty": particle.ty,
            "--rot": particle.rot,
            animationDelay: `${particle.delay}ms`,
            zIndex: 999,
            top: burstPos.top,
            left: burstPos.left,
          }}
        >
          {particle.n}
        </span>
      ))}

      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
        <img
          src={product.cover_url}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-stretch divide-x divide-white/8 border-t border-white/8 bg-[rgba(20,20,22,0.95)] backdrop-blur-sm transition-transform duration-200 group-hover:translate-y-0">
          {canPlay ? (
            <>
              <button
                onClick={handlePlay}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${isPlaying ? "bg-accent text-white" : "text-white/70 hover:bg-accent hover:text-white"}`}
              >
                {isPlaying ? "Playing" : "Preview"}
              </button>
              <button
                ref={wishBtnRef}
                onClick={handleWishlist}
                className={`relative flex items-center justify-center px-3 py-2.5 transition-all duration-200 ${wishlisted ? "scale-110 text-accent" : "text-white/70 hover:scale-110 hover:text-accent"}`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlisted && <span className="absolute inset-0 rounded-full bg-accent/20 pointer-events-none animate-ping" />}
                <ProductHeartIcon filled={wishlisted} />
              </button>
              <button onClick={handleQuickAdd} className={`flex items-center justify-center px-3 py-2.5 transition-all ${flashed ? "bg-accent text-white" : "text-white/70 hover:bg-accent hover:text-white"}`} aria-label="Add to cart">
                {flashed ? "✓" : "+"}
              </button>
            </>
          ) : (
            <>
              <button
                ref={wishBtnRef}
                onClick={handleWishlist}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${wishlisted ? "text-accent" : "text-white/70 hover:text-accent"}`}
              >
                <ProductHeartIcon filled={wishlisted} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button onClick={handleQuickAdd} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${flashed ? "bg-accent text-white" : "text-white/70 hover:bg-accent hover:text-white"}`}>
                {flashed ? "Added" : "Add to cart"}
              </button>
            </>
          )}
        </div>

        {product.name_your_price && (
          <span className="absolute left-1.5 top-1.5 rounded bg-brand-purple px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Pay what you want
          </span>
        )}

        <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded border border-white/10 bg-[rgba(28,28,30,0.75)] px-2.5 py-1 text-[12px] font-medium text-white/65 backdrop-blur-sm">
          <span>{typeBadge.icon}</span>
          {typeBadge.label}
        </span>
      </div>

      <div className="px-[5%] pb-1">
        <h3 className="truncate text-[14px] font-semibold leading-snug text-white/88 transition-colors group-hover:text-white">
          {product.title}
        </h3>
        <p className="truncate text-[12px] text-white/45">
          by{" "}
          {artistSlug ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/artist/${artistSlug}`);
              }}
              className="transition-colors hover:text-white/75"
            >
              {artistName}
            </button>
          ) : (
            artistName
          )}
        </p>
        {genres.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre) => (
              <span key={genre._id || genre.slug || genre.name} className="rounded bg-white/[0.07] px-1.5 py-0.5 text-[10px] leading-none text-white/50">
                {genre.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-0.5 flex items-center justify-between">
          <span className="whitespace-nowrap text-[14px] font-semibold text-white/85">
            {product.name_your_price ? "from " : ""}
            {formatPrice(product.price)}
          </span>
          {wishlisted && <ProductHeartIcon size={18} filled />}
        </div>
      </div>
    </Link>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { apiGet } from "../../lib/api";
import { useCart } from "../context/CartContext";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import PlayButton from "../components/audio/PlayButton";
import ProductCard from "../components/product/ProductCard";
import { formatPrice, formatDuration, formatDate } from "../data/helpers";
import { getArtistName, getArtistSlug, getProductGenres, getProductTracks } from "../utils/productShape";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isProductPlaying } = useAudioPlayer();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet(`/products/${slug}`);
        const nextProduct = response.data || response;
        if (cancelled) return;

        setProduct(nextProduct);
        setCustomPrice(nextProduct.price || 0);
        setSelectedVariant(nextProduct.detail?.variants?.[0] || null);
        setQty(1);
        setAdded(false);
        setPriceError("");

        const artistKey = nextProduct.artist?._id || nextProduct.artist_id;
        if (artistKey) {
          const relatedResponse = await apiGet(`/products?artist=${artistKey}&limit=10&sort=newest`);
          if (!cancelled) {
            const list = relatedResponse.data || [];
            setRelatedProducts(list.filter((item) => item._id !== nextProduct._id).slice(0, 5));
          }
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setRelatedProducts([]);
          setError(err.message || "Product not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/30 text-2xl mb-3">404</p>
          <p className="text-white/50 text-[15px] mb-6">{error || "Product not found"}</p>
          <Link to="/shop" className="text-accent hover:underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  const genres = getProductGenres(product);
  const tracks = getProductTracks(product);
  const albumTrackProducts = product.type === "album" ? tracks : [];
  const artistSlug = getArtistSlug(product);
  const artistName = getArtistName(product);
  const finalPrice = product.name_your_price ? customPrice : product.price;
  const merchVariants = product.type === "merch" ? (product.detail?.variants || []) : [];
  const totalStock = merchVariants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0);
  const isMerchSoldOut = product.type === "merch" && merchVariants.length > 0 && totalStock === 0;
  const isSelectedVariantOutOfStock = product.type === "merch" && selectedVariant?.stock_quantity === 0;
  const addToCartDisabled = Boolean(priceError) || isMerchSoldOut || isSelectedVariantOutOfStock;

  const handleAddToCart = () => {
    if (product.name_your_price && customPrice < (product.min_price || 0)) {
      setPriceError(`Minimum ${formatPrice(product.min_price || 0)}`);
      return;
    }
    if (addToCartDisabled) return;

    addToCart(product, {
      quantity: qty,
      unitPrice: finalPrice,
      variantId: selectedVariant?.variant_id || null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="px-[5%] py-8 md:px-[10%] md:py-10">
        <Link to="/shop" className="inline-flex items-center gap-2.5 no-underline group w-fit mb-10 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-full transition-all">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-all group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-white/60 group-hover:text-white text-[14px] font-medium transition-colors">Back to shop</span>
        </Link>

        <div className="max-w-5xl mx-auto flex flex-col gap-14 md:flex-row">
          <div className="w-full shrink-0 md:w-96">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-card shadow-[0_8px_40px_rgba(0,0,0,0.6)] group">
              {product.cover_url ? <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/[0.06]" />}

              {(product.type === "single" || product.type === "album") && tracks.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayButton product={product.type === "album" ? (albumTrackProducts[0] || product) : product} contextQueue={product.type === "album" ? albumTrackProducts : [product]} size="lg" variant="overlay" />
                </div>
              )}

              <span className="absolute top-3 right-3 bg-[rgba(28,28,30,0.85)] backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[11px] text-white/65 font-medium capitalize">
                {product.type}
              </span>
              {product.name_your_price && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest bg-brand-purple text-white">Pay what you want</span>}
              {isMerchSoldOut && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest bg-white/20 text-white/80 backdrop-blur-sm border border-white/20">Sold Out</span>}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div>
              {genres.length > 0 && <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-1">{genres[0].name}</p>}
              <h1 className="text-[2.4rem] font-bold text-white leading-tight">{product.title}</h1>
              <p className="mt-1 text-white/50 text-[14px]">
                by {artistSlug ? <Link to={`/artist/${artistSlug}`} className="no-underline hover:underline text-white/50">{artistName}</Link> : artistName}
              </p>
              {product.release_date && <p className="mt-2 text-white/30 text-[12px]">Released {formatDate(product.release_date)}</p>}
            </div>

            <div className="border-t border-white/[0.064]" />
            {product.description && <p className="text-white/55 text-[14px] leading-[1.8]">{product.description}</p>}
            <div className="border-t border-white/[0.064]" />

            {product.type === "album" && tracks.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">Tracklist ({tracks.length} tracks)</p>
                <ul className="rounded-lg border border-white/[0.064] divide-y divide-white/[0.064] overflow-hidden">
                  {tracks.map((track, index) => {
                    const playing = isProductPlaying(track._id);
                    return (
                      <li key={track._id || index} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${playing ? "bg-accent/10" : "bg-white/4 hover:bg-white/8"}`}>
                        <div className="w-6 flex items-center justify-center">
                          <PlayButton product={track} contextQueue={albumTrackProducts} size="sm" variant="minimal" />
                        </div>
                        <span className={`flex-1 text-[14px] ${playing ? "text-accent font-semibold" : "text-white/85"}`}>{track.title || `Track ${index + 1}`}</span>
                        <span className="text-white/35 text-[12px] tabular-nums">{formatDuration(track.duration_sec)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {product.type === "single" && product.detail?.duration_sec && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/35 mb-1">Duration</p>
                <p className="text-white/85 text-[15px] font-medium">{formatDuration(product.detail.duration_sec)}</p>
              </div>
            )}

            {product.type === "merch" && merchVariants.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">Choose option</p>
                <div className="flex flex-wrap gap-2">
                  {merchVariants.map((variant) => (
                    <button key={variant.variant_id} onClick={() => variant.stock_quantity > 0 && setSelectedVariant(variant)} disabled={variant.stock_quantity === 0} className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${selectedVariant?.variant_id === variant.variant_id ? "bg-accent border-accent text-white" : variant.stock_quantity === 0 ? "bg-white/5 border-white/10 text-white/25 cursor-not-allowed line-through" : "bg-white/5 border-white/15 text-white/70 hover:border-white/30"}`}>
                      {[variant.size, variant.color].filter(Boolean).join(" / ") || "One size"}
                      {variant.stock_quantity > 0 && variant.stock_quantity < 10 && <span className="ml-2 text-[10px] text-orange-400">only {variant.stock_quantity} left</span>}
                    </button>
                  ))}
                </div>
                {isSelectedVariantOutOfStock && <p className="text-[11px] text-accent mt-2">This variant is out of stock. Please choose another.</p>}
              </div>
            )}

            <div className="border-t border-white/[0.064]" />

            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/35 mb-1">{product.name_your_price ? "Name your price" : "Price"}</p>
              {product.name_your_price ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/55 text-[20px]">฿</span>
                    <input type="number" value={customPrice} onChange={(e) => {
                      const value = Number(e.target.value);
                      setCustomPrice(value);
                      setPriceError(value < (product.min_price || 0) ? `Minimum ${formatPrice(product.min_price || 0)}` : "");
                    }} className="bg-white/5 border border-white/15 rounded-md px-3 py-2 text-[20px] text-white font-bold w-32 outline-none focus:border-brand-purple" min={product.min_price || 0} />
                  </div>
                  <p className="text-white/35 text-[12px]">Minimum {formatPrice(product.min_price || 0)}. Pay more to support the artist.</p>
                  {priceError && <p className="text-red-400 text-[12px]">{priceError}</p>}
                </div>
              ) : (
                <p className="text-[2rem] font-bold text-white">{formatPrice(product.price)}</p>
              )}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">Quantity</p>
              <div className="flex items-center w-fit rounded-lg overflow-hidden border border-white/15 bg-white/5">
                <button onClick={() => setQty((value) => Math.max(1, value - 1))} className="w-10 h-10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 text-lg font-bold">-</button>
                <span className="w-10 text-center text-white/88 font-semibold text-[14px]">{qty}</span>
                <button onClick={() => setQty((value) => value + 1)} className="w-10 h-10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 text-lg font-bold">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={addToCartDisabled} className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-semibold text-[15px] transition-all active:scale-95 w-full md:w-fit ${added ? "bg-white/[0.07] border border-white/15 text-white/60 cursor-default" : isMerchSoldOut ? "bg-white/5 text-white/30 cursor-not-allowed" : addToCartDisabled ? "bg-white/5 text-white/25 cursor-not-allowed" : "bg-accent hover:bg-accent-hover text-white"}`}>
              {added ? "Added to cart" : isMerchSoldOut ? "Sold Out" : `Add to cart - ${formatPrice(finalPrice * qty)}`}
            </button>

            {product.type !== "merch" && <p className="text-white/25 text-[11px]">Includes unlimited streaming plus download in MP3, FLAC, and more.</p>}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <div className="border-t border-white/[0.064] mb-8" />
            <h2 className="text-[13px] uppercase tracking-widest text-white/40 font-semibold mb-6">
              More from {artistSlug ? <Link to={`/artist/${artistSlug}`} className="text-white/60 hover:text-white no-underline transition-colors">{artistName}</Link> : artistName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
              {relatedProducts.map((item) => <ProductCard key={item._id} product={item} contextQueue={relatedProducts} />)}
            </div>
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-bg px-[5%] py-8 font-['Plus_Jakarta_Sans',sans-serif] md:px-[10%] md:py-10">
      <div className="mb-10 h-10 w-32 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="mx-auto flex max-w-5xl flex-col gap-14 md:flex-row">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/[0.06] md:w-96" />
        <div className="flex-1 space-y-5">
          <div className="h-5 w-28 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-4 w-44 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-px w-full bg-white/[0.064]" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { apiGet } from "../../lib/api";
import { useCart } from "../context/CartContext";
import PlayButton from "../components/audio/PlayButton";
import ProductCard from "../components/product/ProductCard";
import { formatDuration, formatPrice } from "../data/helpers";
import { getArtistName, getArtistSlug, getProductGenres, getProductTracks } from "../utils/productShape";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [moreFromArtist, setMoreFromArtist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [qty, setQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const result = await apiGet(`/products/${slug}`);
        const nextProduct = result.data;
        if (cancelled) return;

        setProduct(nextProduct);
        setCustomPrice(nextProduct?.price || 0);
        setSelectedVariant(nextProduct?.detail?.variants?.[0] || null);

        if (nextProduct?.artist_id) {
          const artistProducts = await apiGet(`/products?artist=${nextProduct.artist_id}&limit=20`);
          if (!cancelled) {
            setMoreFromArtist((artistProducts.data || []).filter((item) => item._id !== nextProduct._id));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setMoreFromArtist([]);
          setLoadError(err.message || "Product not found");
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

  const tracks = useMemo(() => getProductTracks(product), [product]);
  const genres = getProductGenres(product);
  const artistSlug = getArtistSlug(product);
  const artistName = getArtistName(product);
  const merchVariants = product?.type === "merch" ? product?.detail?.variants || [] : [];
  const totalStock = merchVariants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0);
  const isMerchSoldOut = product?.type === "merch" && totalStock === 0;
  const isSelectedVariantOutOfStock = product?.type === "merch" && selectedVariant?.stock_quantity === 0;
  const finalPrice = product?.name_your_price ? customPrice : product?.price || 0;
  const addToCartDisabled = !!priceError || isMerchSoldOut || isSelectedVariantOutOfStock;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.name_your_price && customPrice < product.min_price) {
      setPriceError(`Minimum ${formatPrice(product.min_price)}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white/40 text-[15px]">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/30 text-2xl mb-3">404</p>
          <p className="text-white/50 text-[15px] mb-6">{loadError || "Product not found"}</p>
          <Link to="/shop" className="text-accent hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="px-[5%] py-8 md:px-[10%] md:py-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2.5 no-underline group w-fit mb-10 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-full transition-all"
        >
          <span className="text-white/60 group-hover:text-white text-[14px] font-medium transition-colors">
            Back to shop
          </span>
        </Link>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-14">
          <div className="w-full shrink-0 md:w-96">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-card shadow-[0_8px_40px_rgba(0,0,0,0.6)] group">
              <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover" />

              {(product.type === "single" || product.type === "album") && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayButton product={product} contextQueue={product.type === "album" ? [product] : null} size="lg" variant="overlay" />
                </div>
              )}

              <span className="absolute top-3 right-3 bg-[rgba(28,28,30,0.85)] backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[11px] text-white/65 font-medium">
                {product.type}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div>
              {genres.length > 0 && (
                <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-1">
                  {genres[0].name}
                </p>
              )}
              <h1 className="text-[2.4rem] font-bold text-white leading-tight">{product.title}</h1>
              <p className="mt-1 text-white/50 text-[14px]">
                by{" "}
                {artistSlug ? (
                  <Link to={`/artist/${artistSlug}`} className="no-underline hover:underline text-white/50">
                    {artistName}
                  </Link>
                ) : (
                  artistName
                )}
              </p>
            </div>

            <div className="border-t border-white/[0.064]" />

            <p className="text-white/55 text-[14px] leading-[1.8]">{product.description}</p>

            {(product.type === "album" || product.type === "single") && tracks.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">
                  {product.type === "album" ? `Tracklist (${tracks.length} tracks)` : "Track"}
                </p>
                <ul className="rounded-lg border border-white/[0.064] divide-y divide-white/[0.064] overflow-hidden">
                  {tracks.map((track, index) => (
                    <li key={track._id || index} className="flex items-center gap-3 px-4 py-2.5 bg-white/4">
                      <span className="w-6 text-white/30 text-[12px]">{index + 1}</span>
                      <span className="flex-1 text-[14px] text-white/85">{track.title}</span>
                      <span className="text-white/35 text-[12px] tabular-nums">
                        {formatDuration(track.duration_sec)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.type === "merch" && merchVariants.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">Choose option</p>
                <div className="flex flex-wrap gap-2">
                  {merchVariants.map((variant) => (
                    <button
                      key={variant.variant_id}
                      onClick={() => variant.stock_quantity > 0 && setSelectedVariant(variant)}
                      disabled={variant.stock_quantity === 0}
                      className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                        selectedVariant?.variant_id === variant.variant_id
                          ? "bg-accent border-accent text-white"
                          : variant.stock_quantity === 0
                            ? "bg-white/5 border-white/10 text-white/25 cursor-not-allowed line-through"
                            : "bg-white/5 border-white/15 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {[variant.size, variant.color].filter(Boolean).join(" / ") || "Default"}
                      {variant.stock_quantity > 0 && variant.stock_quantity < 10 && (
                        <span className="ml-2 text-[10px] text-orange-400">only {variant.stock_quantity} left</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-white/[0.064]" />

            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/35 mb-1">
                {product.name_your_price ? "Name your price" : "Price"}
              </p>
              {product.name_your_price ? (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setCustomPrice(value);
                      setPriceError(value < product.min_price ? `Minimum ${formatPrice(product.min_price)}` : "");
                    }}
                    className="bg-white/5 border border-white/15 rounded-md px-3 py-2 text-[20px] text-white font-bold w-32 outline-none focus:border-brand-purple"
                    min={product.min_price}
                  />
                  <p className="text-white/35 text-[12px]">Minimum {formatPrice(product.min_price)}</p>
                  {priceError && <p className="text-red-400 text-[12px]">{priceError}</p>}
                </div>
              ) : (
                <p className="text-[2rem] font-bold text-white">{formatPrice(product.price)}</p>
              )}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">Quantity</p>
              <div className="flex items-center w-fit rounded-lg overflow-hidden border border-white/15 bg-white/5">
                <button onClick={() => setQty((value) => Math.max(1, value - 1))} className="w-10 h-10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 text-lg font-bold">
                  -
                </button>
                <span className="w-10 text-center text-white/88 font-semibold text-[14px]">{qty}</span>
                <button onClick={() => setQty((value) => value + 1)} className="w-10 h-10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 text-lg font-bold">
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addToCartDisabled}
              className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-semibold text-[15px] transition-all active:scale-95 w-full md:w-fit ${
                added
                  ? "bg-white/[0.07] border border-white/15 text-white/60 cursor-default"
                  : addToCartDisabled
                    ? "bg-white/5 text-white/25 cursor-not-allowed"
                    : "bg-accent hover:bg-accent-hover text-white"
              }`}
            >
              {added ? "Added to cart" : `Add to cart - ${formatPrice(finalPrice * qty)}`}
            </button>
          </div>
        </div>

        {moreFromArtist.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <div className="border-t border-white/[0.064] mb-8" />
            <h2 className="text-[13px] uppercase tracking-widest text-white/40 font-semibold mb-6">
              More from {artistName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
              {moreFromArtist.map((item) => (
                <ProductCard key={item._id} product={item} contextQueue={moreFromArtist} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
}

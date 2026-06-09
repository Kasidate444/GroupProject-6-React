import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../lib/api";

const formatPrice = (value) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getArtistName = (product) =>
  product?.artist?.name ||
  product?.artist?.display_name ||
  product?.artist?.username ||
  product?.artist_name ||
  product?.artistName ||
  "Unknown artist";

const getProductsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.products)) return response.data.products;
  return [];
};

const getProductImage = (product) =>
  product?.cover_url ||
  product?.coverUrl ||
  product?.image_url ||
  product?.imageUrl ||
  product?.images?.[0] ||
  "/vite.svg";

function SearchLoading() {
  return (
    <div className="space-y-2 px-3 py-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 rounded-lg px-1 py-1.5"
        >
          <div className="h-11 w-11 animate-pulse rounded-md bg-white/10" />
          <div className="min-w-0 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/12" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/8" />
          </div>
          <div className="h-3.5 w-14 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export default function SearchBar() {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const query = input.trim();
  const showResults = focused && query.length > 0;
  const visibleResults = query ? results : [];
  const visibleLoading = query ? loading : false;
  const visibleError = query ? error : "";

  useEffect(() => {
    if (!query) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ q: query, limit: "6" });
        const response = await apiGet(`/products?${params.toString()}`);
        if (!cancelled) {
          setResults(getProductsFromResponse(response));
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err.message || "Search failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFocused(true);
  };

  const handleClear = () => {
    setInput("");
    setResults([]);
    setError("");
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex w-full items-center gap-2 rounded-full border-[1.5px] border-white/25 bg-white/12 px-4 py-2 transition-[border-color,box-shadow,background] duration-200 focus-within:border-white/60 focus-within:bg-white/15 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.1)]">
          <button
            type="submit"
            className="flex shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white"
            aria-label="Search"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              search
            </span>
          </button>
          <input
            className="w-full border-0 bg-transparent font-['Plus_Jakarta_Sans',sans-serif] text-sm text-white outline-none placeholder:text-white/55"
            type="text"
            placeholder="Search music, artist, merch"
            value={input}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(e) => setInput(e.target.value)}
          />
          {input && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
              className="shrink-0 text-xs font-semibold text-white/40 transition-colors hover:text-white/75"
              aria-label="Clear search"
            >
              x
            </button>
          )}
        </div>
      </form>

      {showResults && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[420px] overflow-y-auto rounded-xl border border-white/10 bg-[#111118]/95 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          onMouseDown={(event) => event.preventDefault()}
        >
          {visibleLoading ? (
            <SearchLoading />
          ) : visibleError ? (
            <div className="px-4 py-5 text-center text-sm text-white/55">
              {visibleError}
            </div>
          ) : visibleResults.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-white/55">
              No results for "{query}"
            </div>
          ) : (
            visibleResults.map((product) => (
              <Link
                key={product._id || product.id || product.slug}
                to={`/product/${product.slug || product._id || product.id}`}
                onClick={() => {
                  setInput("");
                  setFocused(false);
                }}
                className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 no-underline transition-colors hover:bg-white/8"
              >
                <img
                  src={getProductImage(product)}
                  alt={product.title || product.name || "Product"}
                  className="h-11 w-11 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {product.title || product.name}
                  </div>
                  <div className="truncate text-xs text-white/50">
                    {getArtistName(product)} / {product.type || "product"}
                  </div>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-white/85">
                  {formatPrice(product.price)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
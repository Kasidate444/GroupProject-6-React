import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../lib/api";
import { formatPrice } from "../../shop/data/helpers";
import { getArtistName } from "../../shop/utils/productShape";

const SEARCH_LIMIT = 6;
const SEARCH_DEBOUNCE_MS = 250;

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
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ q: query, limit: String(SEARCH_LIMIT) });
        const response = await apiGet(`/products?${params.toString()}`);
        if (!cancelled) setResults(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err.message || "Search failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFocused(true);
  };

  const clearSearch = () => {
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
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onChange={(event) => setInput(event.target.value)}
          />
          {input && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearSearch}
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
            <div className="px-4 py-5 text-center text-sm text-[#fc3c44]">
              {visibleError}
            </div>
          ) : visibleResults.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-white/55">
              No results for "{query}"
            </div>
          ) : (
            visibleResults.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product.slug || product._id}`}
                onClick={() => {
                  clearSearch();
                  setFocused(false);
                }}
                className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 no-underline transition-colors hover:bg-white/8"
              >
                {product.cover_url ? (
                  <img
                    src={product.cover_url}
                    alt={product.title}
                    className="h-11 w-11 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-md bg-white/[0.07]" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {product.title || product.name}
                  </div>
                  <div className="truncate text-xs text-white/50">
                    {getArtistName(product)} · {product.type}
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

function SearchLoading() {
  return (
    <div className="space-y-2 px-3 py-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-1">
          <div className="h-11 w-11 animate-pulse rounded-md bg-white/8" />
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/8" />
          </div>
          <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
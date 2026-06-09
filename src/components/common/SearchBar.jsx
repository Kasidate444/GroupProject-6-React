import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatPrice,
  getAllProductsWithArtist,
  searchProducts,
} from "../../shop/data/helpers";

export default function SearchBar() {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const query = input.trim();
  const products = useMemo(() => getAllProductsWithArtist(), []);
  const results = query ? searchProducts(products, query).slice(0, 6) : [];
  const showResults = focused && query.length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setFocused(true);
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
            onChange={(e) => setInput(e.target.value)}
          />
          {input && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setInput("")}
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
          {results.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-white/55">
              No results for "{query}"
            </div>
          ) : (
            results.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                onClick={() => {
                  setInput("");
                  setFocused(false);
                }}
                className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 no-underline transition-colors hover:bg-white/8"
              >
                <img
                  src={product.cover_url}
                  alt={product.title}
                  className="h-11 w-11 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {product.title}
                  </div>
                  <div className="truncate text-xs text-white/50">
                    {product.artist?.name || product.type} · {product.type}
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

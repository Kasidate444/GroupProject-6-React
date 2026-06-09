import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { apiGet } from "../../lib/api";
import ProductCard from "../components/product/ProductCard";
import { CATEGORIES } from "../data/constants";
import { genres } from "../data/mockDb";

const SHOP_SKELETON_COUNT = 14;

export default function ShopPage() {
  const { genres: genresParam } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory = CATEGORIES.some((cat) => cat.key === categoryParam) ? categoryParam : "all";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [musicSubFilter, setMusicSubFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const selectedGenres = genresParam ? genresParam.split("+").filter(Boolean) : [];
  const selectedGenreKey = selectedGenres[0] || "";

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setLoadError("");

      const params = new URLSearchParams({ limit: "100" });
      if (search.trim()) params.set("q", search.trim());
      if (selectedGenreKey) params.set("genre", selectedGenreKey);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedCategory === "digital" && musicSubFilter !== "all") {
        params.set("type", musicSubFilter);
      }

      try {
        const result = await apiGet(`/products?${params.toString()}`);
        if (!cancelled) setProducts(result.data || []);
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setLoadError(err.message || "Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [search, selectedCategory, musicSubFilter, selectedGenreKey]);

  const filtered = products;

  const toggleGenre = (slug) => {
    const next = selectedGenres.includes(slug)
      ? selectedGenres.filter((item) => item !== slug)
      : [...selectedGenres, slug];

    if (next.length === 0) {
      navigate("/shop");
    } else {
      navigate(`/discover/${next.join("+")}`);
    }
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedCategory !== "all" || search !== "" || musicSubFilter !== "all";

  const clearAll = () => {
    setSearch("");
    setSelectedCategory("all");
    setMusicSubFilter("all");
    navigate("/shop");
  };

  const updateCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setMusicSubFilter("all");
    setSearchParams(categoryKey === "all" ? {} : { category: categoryKey });
  };

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="px-[5%] pb-6 pt-10">
        <h1 className="text-[2.6rem] font-bold tracking-tight text-white">Discover music</h1>
        <p className="mt-1.5 text-[16px] text-white/50">Independent artists. Direct to fans. Own your music.</p>
      </div>

      <div className="space-y-4 px-[5%] pb-6">
        <div className="flex max-w-lg items-center gap-2 rounded-md border border-white/10 bg-white/[0.07] px-3 py-2 transition-colors focus-within:border-white/30">
          <svg className="shrink-0 text-white/40" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, artist, genre..."
            className="w-full bg-transparent text-[14px] text-white/85 outline-none placeholder:text-white/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[10px] text-white/30 transition-colors hover:text-white/60">
              Clear
            </button>
          )}
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-widest text-white/30">Genre</p>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill active={selectedGenres.length === 0} onClick={() => navigate("/shop")}>all genres</FilterPill>
            {genres.map((genre) => (
              <FilterPill key={genre._id} active={selectedGenres.includes(genre.slug)} onClick={() => toggleGenre(genre.slug)}>
                {genre.name.toLowerCase()}
              </FilterPill>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-white/30">Category</p>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((category) => (
              <CategoryPill key={category.key} active={selectedCategory === category.key} icon={category.icon} onClick={() => updateCategory(category.key)}>
                {category.label}
              </CategoryPill>
            ))}
            {hasActiveFilters && (
              <button onClick={clearAll} className="ml-2 text-[11px] text-white/30 underline underline-offset-2 transition-colors hover:text-white/60">
                clear all
              </button>
            )}
          </div>
        </div>

        {selectedCategory === "digital" && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-widest text-white/30">Show</p>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All digital" },
                { key: "single", label: "Singles only" },
                { key: "album", label: "Albums only" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setMusicSubFilter(option.key)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${musicSubFilter === option.key ? "bg-brand-purple text-white" : "bg-white/[0.07] text-white/55 hover:bg-white/10 hover:text-white/85"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-[5%] py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] text-white/40">
            {loading ? "Loading products..." : `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
          </p>
        </div>

        {loadError ? (
          <div className="py-24 text-center"><p className="text-[15px] text-[#fc3c44]">{loadError}</p></div>
        ) : loading ? (
          <ShopSkeletonGrid />
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[15px] text-white/30">No products found.</p>
            <button onClick={clearAll} className="mt-3 text-[13px] text-accent underline-offset-2 hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {filtered.map((product) => <ProductCard key={product._id} product={product} contextQueue={filtered} />)}
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
}

function ShopSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
      {Array.from({ length: SHOP_SKELETON_COUNT }).map((_, index) => <ShopSkeletonCard key={index} />)}
    </div>
  );
}

function ShopSkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-xl">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
        <div className="h-full w-full animate-pulse bg-white/8" />
      </div>
      <div className="px-[5%] pb-1">
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-white/8" />
        <div className="mt-2 flex gap-1">
          <div className="h-5 w-12 animate-pulse rounded bg-white/[0.07]" />
          <div className="h-5 w-10 animate-pulse rounded bg-white/[0.07]" />
        </div>
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/12" />
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4.5 py-1.75 text-[15px] font-medium transition-all ${active ? "bg-accent text-white" : "bg-white/[0.07] text-white/55 hover:bg-white/10 hover:text-white/85"}`}>
      {children}
    </button>
  );
}

function CategoryPill({ active, icon, onClick, children }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full border px-3.75 py-1.75 text-[14px] font-medium transition-all ${active ? "border-[rgba(252,60,68,0.45)] bg-[rgba(252,60,68,0.15)] text-white" : "border-white/10 bg-transparent text-white/45 hover:border-white/25 hover:text-white/75"}`}>
      <span className="text-[11px]">{icon}</span>
      {children}
    </button>
  );
}

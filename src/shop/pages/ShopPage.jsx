import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Footer from "../../components/common/Footer";
import ProductCard from "../components/product/ProductCard";
import { genres } from "../data/mockDb";
import { CATEGORIES } from "../data/constants";
import {
  getAllProductsWithArtist,
  filterProductsByCategory,
  filterProductsByGenres,
  searchProducts,
} from "../data/helpers";
 
export default function ShopPage() {
  const { genres: genresParam } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory = CATEGORIES.some((cat) => cat.key === categoryParam)
    ? categoryParam
    : "all";
 
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [musicSubFilter, setMusicSubFilter] = useState("all");

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setMusicSubFilter("all");
  }, [initialCategory]);
 
  // === แทน useMemo ด้วยการคำนวณตรงๆ ===
  const selectedGenres = genresParam
    ? genresParam.split("+").filter(Boolean)
    : [];
 
  let filtered = getAllProductsWithArtist();
  filtered = filterProductsByGenres(filtered, selectedGenres);
  filtered = filterProductsByCategory(filtered, selectedCategory);
 
  if (selectedCategory === "digital" && musicSubFilter !== "all") {
    filtered = filtered.filter((p) => p.type === musicSubFilter);
  }
 
  filtered = searchProducts(filtered, search);
 
  const toggleGenre = (slug) => {
    const next = selectedGenres.includes(slug)
      ? selectedGenres.filter((s) => s !== slug)
      : [...selectedGenres, slug];
    if (next.length === 0) {
      navigate("/shop");
    } else {
      navigate(`/discover/${next.join("+")}`);
    }
  };
 
  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedCategory !== "all" ||
    search !== "" ||
    musicSubFilter !== "all";
 
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
      {/* Hero */}
      <div className="px-[5%] pt-10 pb-6">
        <h1 className="text-white text-[2.6rem] font-bold tracking-tight">
          Discover music
        </h1>
        <p className="text-white/50 text-[16px] mt-1.5">
          Independent artists. Direct to fans. Own your music.
        </p>
      </div>
 
      {/* Filters */}
      <div className="px-[5%] pb-6 space-y-4">
        <div className="flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-md px-3 py-2 max-w-lg focus-within:border-white/30 transition-colors">
          <svg
            className="text-white/40 shrink-0"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, artist, genre…"
            className="bg-transparent outline-none text-[14px] text-white/85 placeholder:text-white/30 w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/30 hover:text-white/60 transition-colors text-[10px]"
            >
              ✕
            </button>
          )}
        </div>
 
        {/* Genre */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/30 mb-2">
            Genre
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <FilterPill
              active={selectedGenres.length === 0}
              onClick={() => navigate("/shop")}
            >
              all genres
            </FilterPill>
            {genres.map((g) => (
              <FilterPill
                key={g._id}
                active={selectedGenres.includes(g.slug)}
                onClick={() => toggleGenre(g.slug)}
              >
                {g.name.toLowerCase()}
              </FilterPill>
            ))}
          </div>
        </div>
 
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
            Category
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.key}
                active={selectedCategory === cat.key}
                icon={cat.icon}
                onClick={() => updateCategory(cat.key)}
              >
                {cat.label}
              </CategoryPill>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="ml-2 text-[11px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
              >
                clear all
              </button>
            )}
          </div>
        </div>
 
        {selectedCategory === "digital" && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              Show
            </p>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All digital" },
                { key: "single", label: "Singles only" },
                { key: "album", label: "Albums only" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setMusicSubFilter(opt.key)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                    musicSubFilter === opt.key
                      ? "bg-brand-purple text-white"
                      : "bg-white/[0.07] text-white/55 hover:bg-white/10 hover:text-white/85"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
 
      <div className="px-[5%] py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/40 text-[13px]">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>
 
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 text-[15px]">No products found.</p>
            <button
              onClick={clearAll}
              className="mt-3 text-accent text-[13px] underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {filtered.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                contextQueue={filtered}
              />
            ))}
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
}
 
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4.5 py-1.75 rounded-full text-[15px] font-medium transition-all ${
        active
          ? "bg-accent text-white"
          : "bg-white/[0.07] text-white/55 hover:bg-white/10 hover:text-white/85"
      }`}
    >
      {children}
    </button>
  );
}
 
function CategoryPill({ active, icon, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.75 py-1.75 rounded-full text-[14px] font-medium border transition-all ${
        active
          ? "bg-[rgba(252,60,68,0.15)] text-white border-[rgba(252,60,68,0.45)]"
          : "bg-transparent text-white/45 border-white/10 hover:border-white/25 hover:text-white/75"
      }`}
    >
      <span className="text-[11px]">{icon}</span>
      {children}
    </button>
  );
}

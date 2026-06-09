import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { apiGet } from "../../lib/api";
import ProductCard from "../components/product/ProductCard";
import FollowButton from "../components/FollowButton";

export default function ArtistPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadArtist = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet(`/artists/${slug}`);
        if (cancelled) return;
        const nextArtist = response.data || null;
        setArtist(nextArtist);
        setProducts(nextArtist?.products || []);
      } catch (err) {
        if (!cancelled) {
          setArtist(null);
          setProducts([]);
          setError(err.message || "Artist not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadArtist();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <ArtistSkeleton />;
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/30 text-2xl mb-3">404</p>
          <p className="text-white/50 text-[15px] mb-6">{error || "Artist not found"}</p>
          <Link to="/shop" className="text-accent hover:underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  const bannerUrl = artist.banner_url || artist.banner_picture_url || artist.avatar_url;
  const avatarUrl = artist.avatar_url || artist.profile_picture_url || bannerUrl;
  const artistGenres = artist.genres || [];

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative h-48 bg-cover bg-center md:h-75" style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <Link to="/shop" className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white text-[13px] no-underline transition-colors">
          Back to shop
        </Link>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-bg-card border-4 border-bg shadow-xl shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt={artist.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/[0.06]" />}
          </div>

          <div className="flex-1 pt-2">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-white text-[2.4rem] font-bold tracking-tight">{artist.name}</h1>
              <FollowButton artistId={artist._id} />
            </div>
            {artist.location && <p className="text-white/55 text-[15px] mt-1">{artist.location}</p>}

            {artistGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {artistGenres.map((genre) => (
                  <span key={genre._id || genre.slug || genre.name} className="px-2.5 py-1 rounded-full bg-white/8 text-white/70 text-[11px] font-medium">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {artist.bio && <p className="text-white/65 text-[14px] mt-4 leading-relaxed max-w-2xl">{artist.bio}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 px-[5%] py-8 md:px-[10%] md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-[1.4rem] font-bold">Releases ({products.length})</h2>
        </div>

        {products.length === 0 ? (
          <p className="text-white/30 text-[14px] text-center py-12">No releases yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
            {products.map((product) => <ProductCard key={product._id} product={product} contextQueue={products} />)}
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
}

function ArtistSkeleton() {
  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="h-48 animate-pulse bg-white/[0.06] md:h-75" />
      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <div className="h-32 w-32 rounded-2xl border-4 border-bg bg-bg-card" />
        <div className="mt-6 h-8 w-64 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-white/8" />
      </div>
    </div>
  );
}

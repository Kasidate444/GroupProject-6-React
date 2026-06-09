import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { apiGet } from "../../lib/api";
import ProductCard from "../components/product/ProductCard";
import FollowButton from "../components/FollowButton";

export default function ArtistPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadArtist = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const result = await apiGet(`/artists/${slug}`);
        if (!cancelled) setArtist(result.data);
      } catch (err) {
        if (!cancelled) {
          setArtist(null);
          setLoadError(err.message || "Artist not found");
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
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white/40 text-[15px]">Loading artist...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/30 text-2xl mb-3">404</p>
          <p className="text-white/50 text-[15px] mb-6">{loadError || "Artist not found"}</p>
          <Link to="/shop" className="text-accent hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const products = artist.products || [];
  const genres = artist.genres || [];
  const bannerUrl = artist.banner_url || artist.profile_picture_url || "";
  const avatarUrl = artist.avatar_url || artist.profile_picture_url || bannerUrl;

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div
        className="relative h-48 bg-cover bg-center md:h-75"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white text-[13px] no-underline transition-colors"
        >
          All artists
        </Link>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-bg-card border-4 border-bg shadow-xl shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/[0.06]" />
            )}
          </div>

          <div className="flex-1 pt-2">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-white text-[2.4rem] font-bold tracking-tight">{artist.name}</h1>
              <FollowButton artistId={artist._id} />
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {genres.map((genre) => (
                  <span
                    key={genre._id || genre.slug || genre.name}
                    className="px-2.5 py-1 rounded-full bg-white/8 text-white/70 text-[11px] font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {artist.bio && (
              <p className="text-white/65 text-[14px] mt-4 leading-relaxed max-w-2xl">{artist.bio}</p>
            )}
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
            {products.map((product) => (
              <ProductCard key={product._id} product={product} contextQueue={products} />
            ))}
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
}

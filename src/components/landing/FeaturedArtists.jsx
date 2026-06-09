import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../lib/api";

const ARTIST_SKELETON_COUNT = 8;
const MIN_MARQUEE_ARTISTS = 18;

const getArtistImage = (artist) => (
  artist.avatar_url || artist.profile_picture_url || artist.banner_url || artist.banner_picture_url || null
);

const getArtistName = (artist) => (
  artist.name || artist.display_name || artist.username || "Artist"
);

const getArtistSlug = (artist) => (
  artist.slug || artist.username || artist._id
);

const repeatArtistsForMarquee = (items) => {
  if (items.length === 0) return [];
  const repeated = [];

  while (repeated.length < MIN_MARQUEE_ARTISTS) {
    repeated.push(...items);
  }

  return repeated.slice(0, Math.max(MIN_MARQUEE_ARTISTS, items.length));
};

function ArtistAvatarFallback({ name }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white/[0.07] text-[22px] font-bold text-white/45">
      {(name || "A")[0].toUpperCase()}
    </div>
  );
}

function ArtistRow({ artists, hidden = false }) {
  return (
    <div
      className="flex shrink-0 animate-[marquee_40s_linear_infinite] flex-row items-center gap-6 pr-6"
      aria-hidden={hidden}
    >
      {artists.map((artist, index) => {
        const name = getArtistName(artist);
        const image = getArtistImage(artist);
        const slug = getArtistSlug(artist);

        return (
          <Link
            key={`${artist._id || slug}-${index}-${hidden}`}
            to={`/artist/${slug}`}
            className="flex shrink-0 flex-col items-center gap-3 no-underline"
          >
            <div className="h-20 w-20 rounded-full ring-2 ring-white/10 transition-all duration-300 hover:scale-105 hover:ring-accent">
              <div className="h-full w-full overflow-hidden rounded-full">
                {image ? (
                  <img
                    className="h-full w-full object-cover"
                    src={image}
                    alt={hidden ? "" : name}
                    loading="lazy"
                  />
                ) : (
                  <ArtistAvatarFallback name={name} />
                )}
              </div>
            </div>
            <div className="max-w-28 text-center">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-white/40">{artist.genre || "Artist"}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ArtistSkeletonRow({ hidden = false }) {
  return (
    <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] flex-row items-center gap-6 pr-6" aria-hidden={hidden}>
      {Array.from({ length: ARTIST_SKELETON_COUNT }).map((_, index) => (
        <div key={`${hidden}-${index}`} className="flex shrink-0 flex-col items-center gap-3">
          <div className="h-20 w-20 animate-pulse rounded-full bg-white/[0.08] ring-2 ring-white/10" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-16 animate-pulse rounded bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadArtists = async () => {
      try {
        const response = await apiGet("/artists?limit=100");
        if (!cancelled) setArtists(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load featured artists:", error);
        if (!cancelled) setArtists([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadArtists();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && artists.length === 0) return null;

  const marqueeArtists = repeatArtistsForMarquee(artists);

  return (
    <section className="my-12 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="mb-8 flex items-baseline gap-4 px-[5%] after:h-px after:flex-1 after:bg-linear-to-r after:from-white/15 after:to-transparent after:content-[''] md:px-[10%]">
        <h2 className="text-[20px] font-extrabold uppercase text-white md:text-[28px]">
          Discover Artists
        </h2>
      </div>

      <div className="flex overflow-hidden p-1 hover:[&>div]:[animation-play-state:paused]">
        {loading ? (
          <>
            <ArtistSkeletonRow />
            <ArtistSkeletonRow hidden />
          </>
        ) : (
          <>
            <ArtistRow artists={marqueeArtists} />
            <ArtistRow artists={marqueeArtists} hidden />
          </>
        )}
      </div>
    </section>
  );
}
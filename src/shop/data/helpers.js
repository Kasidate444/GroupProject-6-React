import { users, genres, artists, products, tracks, albums, merch } from "./mockDb";
import { CATEGORIES } from "./constants";

export const findUserById = (id) => users.find((u) => u._id === id);
export const findArtistById = (id) => artists.find((a) => a._id === id);
export const findArtistBySlug = (slug) => artists.find((a) => a.slug === slug);
export const findGenreById = (id) => genres.find((g) => g._id === id);
export const findProductById = (id) => products.find((p) => p._id === id);
export const findProductBySlug = (slug) =>
  products.find((p) => p.slug === slug);
export const findTrackById = (id) => tracks.find((t) => t._id === id);
export const findAlbumByProductId = (productId) =>
  albums.find((a) => a.product_id === productId);
export const findMerchByProductId = (productId) =>
  merch.find((m) => m.product_id === productId);
export const findTrackByProductId = (productId) =>
  tracks.find((t) => t.product_id === productId);

export const getProductWithDetails = (productId) => {
  const product = findProductById(productId);
  if (!product) return null;

  const artist = findArtistById(product.artist_id);

  let detail = null;
  if (product.type === "single") {
    detail = findTrackByProductId(product._id);
  } else if (product.type === "album") {
    const album = findAlbumByProductId(product._id);
    if (album) {
      const albumTracks = album.track_ids
        .map((tid) => {
          const track = findTrackById(tid);
          if (!track) return null;
          const trackProduct = findProductById(track.product_id);
          return {
            ...track,
            title: trackProduct?.title || "Unknown",
            slug: trackProduct?.slug,
          };
        })
        .filter(Boolean);
      detail = { ...album, tracks: albumTracks };
    }
  } else if (product.type === "merch") {
    detail = findMerchByProductId(product._id);
  }

  return {
    ...product,
    artist,
    detail,
  };
};

export const getAllProductsWithArtist = () => {
  return products
    .filter((p) => p.status === "published" && !p.deleted_at)
    .map((p) => ({
      ...p,
      artist: findArtistById(p.artist_id),
    }));
};

export const getProductsByArtist = (artistId) => {
  return products
    .filter(
      (p) =>
        p.artist_id === artistId && p.status === "published" && !p.deleted_at
    )
    .map((p) => ({
      ...p,
      artist: findArtistById(p.artist_id),
    }));
};

export const getArtistGenres = (artistId) => {
  const artist = findArtistById(artistId);
  if (!artist) return [];
  return artist.genre_ids.map(findGenreById).filter(Boolean);
};

export const getAlbumsContainingTrack = (trackId) => {
  return albums
    .filter((a) => a.track_ids.includes(trackId))
    .map((a) => ({
      ...a,
      product: findProductById(a.product_id),
    }));
};

export const filterProductsByCategory = (productList, category) => {
  if (category === "all" || category === "all categories") {
    return productList;
  }

  return productList.filter((p) => {
    if (category === "digital") {
      return p.type === "single" || p.type === "album";
    }

    if (category === "tshirt") {
      const m = findMerchByProductId(p._id);
      return p.type === "merch" && m?.merch_type === "tshirt";
    }

    if (category === "poster") {
      const m = findMerchByProductId(p._id);
      return p.type === "merch" && m?.merch_type === "poster";
    }

    // ⭐ เพิ่ม snapback / tote ให้ filter ทำงานครบ
    if (category === "snapback") {
      const m = findMerchByProductId(p._id);
      return p.type === "merch" && m?.merch_type === "snapback";
    }

    if (category === "tote") {
      const m = findMerchByProductId(p._id);
      return p.type === "merch" && m?.merch_type === "tote";
    }

    if (category === "vinyl" || category === "cd" || category === "cassette" || category === "other") {
      const m = findMerchByProductId(p._id);
      return p.type === "merch" && m?.merch_type === category;
    }

    return false;
  });
};

export const filterProductsByGenres = (productList, genreSlugs) => {
  if (!genreSlugs || genreSlugs.length === 0) {
    return productList;
  }

  const genreIds = genreSlugs
    .map((slug) => genres.find((g) => g.slug === slug))
    .filter(Boolean)
    .map((g) => g._id);

  if (genreIds.length === 0) return productList;

  return productList.filter((p) => {
    const artist = findArtistById(p.artist_id);
    return genreIds.some((gid) => artist?.genre_ids.includes(gid));
  });
};

export const searchProducts = (productList, query) => {
  if (!query) return productList;
  const q = query.toLowerCase().trim();

  return productList.filter((p) => {
    const artist = findArtistById(p.artist_id);
    const artistGenres = artist
      ? artist.genre_ids.map(findGenreById).filter(Boolean)
      : [];

    const m = findMerchByProductId(p._id);
    const matchedCategories = CATEGORIES.filter((cat) => {
      if (cat.key === "all") return false;
      if (cat.key === "digital") return p.type === "single" || p.type === "album";
      if (cat.key === "tshirt") return p.type === "merch" && m?.merch_type === "tshirt";
      return p.type === "merch" && m?.merch_type === cat.key;
    });

    return (
      p.title.toLowerCase().includes(q) ||
      artist?.name.toLowerCase().includes(q) ||
      artist?.location?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      artistGenres.some((g) => g.name.toLowerCase().includes(q)) ||
      matchedCategories.some((cat) => cat.label.toLowerCase().includes(q))
    );
  });
};

export const formatDuration = (sec) => {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatPrice = (amount) => {
  return `฿${amount.toLocaleString("en-US")}`;
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatType = (type) => {
  if (!type) return "";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const getStats = () => {
  return {
    users: users.length,
    artists: artists.length,
    genres: genres.length,
    products: products.length,
    productsByType: {
      single: products.filter((p) => p.type === "single").length,
      album: products.filter((p) => p.type === "album").length,
      merch: products.filter((p) => p.type === "merch").length,
    },
    tracks: tracks.length,
    albums: albums.length,
    merch: merch.length,
  };
};

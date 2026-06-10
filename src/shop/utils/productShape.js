export const getProductGenres = (product) => {
  return product?.artist?.genres || [];
};

export const getProductMerchType = (product) => {
  return product?.merch_type || product?.merchType || product?.detail?.merch_type || null;
};

const isTrackLike = (item) => {
  return Boolean(item?.preview_url || item?.audio_file_url || item?.audio_url?.url);
};

export const getProductTracks = (product) => {
  if (!product) return [];
  if (isTrackLike(product)) return [product];
  if (Array.isArray(product.tracks)) return product.tracks;
  if (Array.isArray(product.detail?.tracks)) return product.detail.tracks;
  if (product.detail && product.type === "single") return [product.detail];
  return [];
};

export const getFirstPlayableTrack = (product) => {
  return getProductTracks(product).find(isTrackLike) || null;
};

export const getTrackAudioSrc = (track, preferFull = false) => {
  if (preferFull) return track?.audio_file_url || track?.audio_url?.url || track?.preview_url || null;
  return track?.preview_url || track?.audio_file_url || track?.audio_url?.url || null;
};

export const canPreviewProduct = (product, preferFull = false) => {
  const track = getFirstPlayableTrack(product);
  return Boolean(getTrackAudioSrc(track, preferFull));
};

export const getArtistName = (product) => {
  return product?.artist?.name || product?.artist?.display_name || product?.artist?.username || "Unknown";
};

export const getArtistSlug = (product) => {
  return product?.artist?.slug || product?.artist?.username || product?.artist_id || null;
};
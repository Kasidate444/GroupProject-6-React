export const getProductGenres = (product) => {
  return product?.artist?.genres || [];
};

export const getProductMerchType = (product) => {
  return product?.merch_type || product?.merchType || product?.detail?.merch_type || null;
};

export const getProductTracks = (product) => {
  if (!product) return [];
  if (Array.isArray(product.tracks)) return product.tracks;
  if (Array.isArray(product.detail?.tracks)) return product.detail.tracks;
  if (product.detail && product.type === "single") return [product.detail];
  return [];
};

export const getFirstPlayableTrack = (product) => {
  if (!product) return null;
  // product is itself a raw track object (e.g. album tracklist item)
  if (product.preview_url || product.audio_file_url || product.audio_url?.url) return product;
  return getProductTracks(product).find((track) => track?.preview_url || track?.audio_file_url || track?.audio_url?.url) || null;
};

export const getTrackAudioSrc = (track) => {
  return track?.preview_url || track?.audio_file_url || track?.audio_url?.url || null;
};

export const canPreviewProduct = (product) => {
  const track = getFirstPlayableTrack(product);
  return Boolean(getTrackAudioSrc(track));
};

export const getArtistName = (product) => {
  return product?.artist?.name || product?.artist?.display_name || product?.artist?.username || "Unknown";
};

export const getArtistSlug = (product) => {
  return product?.artist?.slug || product?.artist?.username || product?.artist_id || null;
};

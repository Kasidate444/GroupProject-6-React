import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { canPreviewProduct } from "../../utils/productShape";

export default function PlayButton({
  product,
  contextQueue,
  size = "md",
  variant = "default",
  preferFull = false,
}) {
  const { isProductPlaying, currentProduct, togglePlay, playProduct } = useAudioPlayer();
  const canPlay = canPreviewProduct(product, preferFull);
  const isPlaying = isProductPlaying(product?._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPlay) return;

    if (currentProduct?._id === product._id || currentProduct?._albumId === product._id) {
      togglePlay();
    } else {
      playProduct(product, contextQueue, { preferFull });
    }
  };

  if (!canPlay) return null;

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  const iconSize = { sm: 12, md: 16, lg: 22 };

  const variantClasses = {
    default: "bg-white text-black hover:scale-105 active:scale-95 shadow-md",
    overlay: "bg-accent/95 backdrop-blur text-white hover:bg-accent hover:scale-105 active:scale-95 shadow-lg",
    minimal: "bg-white/10 backdrop-blur text-white hover:bg-white/20 active:scale-95",
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center transition-all`}
      aria-label={isPlaying ? "Pause" : preferFull ? "Play" : "Play preview"}
    >
      {isPlaying ? (
        <svg width={iconSize[size]} height={iconSize[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
        </svg>
      ) : (
        <svg width={iconSize[size]} height={iconSize[size]} viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
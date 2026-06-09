import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  findTrackByProductId,
  findAlbumByProductId,
  findTrackById,
  findArtistById,
} from "../data/helpers";

const getFirstTrack = (product) => {
  if (product.type === "album") {
    const album = findAlbumByProductId(product._id);
    return album?.track_ids?.[0] ? findTrackById(album.track_ids[0]) : null;
  }
  return findTrackByProductId(product._id);
};

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  // === State ===
  const [isOpen, setIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);

  // === audio element — สร้างครั้งเดียว ===
  const [audio] = useState(() => {
    const a = new Audio();
    a.volume = 0.7;
    return a;
  });

  // ===========================================================================
  // Core: เล่นเพลงจาก queue ที่ index ที่กำหนด
  // (แยกเป็น internal — playNext/playPrev เรียกตัวนี้ จะได้ไม่ re-compute
  //  queue/index ซ้ำเหมือนโค้ดเดิม ที่ทำให้ index เพี้ยน)
  // ===========================================================================
  const playAtIndex = (q, idx) => {
    if (!q || q.length === 0 || idx < 0 || idx >= q.length) return;
    const product = q[idx];
    const track = getFirstTrack(product);
    if (!track || !track.audio_file_url) return;

    setCurrentProduct(product);
    setCurrentIndex(idx);
    setIsOpen(true);

    audio.src = track.audio_file_url;
    audio.load();
    audio.play().catch((err) => console.error("Play failed:", err));
  };

  // === event listeners — ติดครั้งเดียวตอน mount ===
  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    // เพลงจบ → เล่นเพลงถัดไปใน queue อัตโนมัติ
    const handleEnded = () => {
      setCurrentIndex((idx) => {
        setQueue((q) => {
          const nextIdx = idx + 1;
          if (nextIdx < q.length) {
            setTimeout(() => playAtIndex(q, nextIdx), 0);
          } else {
            audio.pause();
            audio.currentTime = 0;
          }
          return q;
        });
        return idx;
      });
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Volume sync ===
  useEffect(() => {
    audio.volume = volume;
  }, [audio, volume]);

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * เล่นเพลง — ฟังก์ชันเดียวที่ทุกหน้าเรียกใช้
   * @param {Object} product       product ที่จะเล่น
   * @param {Array}  contextQueue  รายการ products รอบๆ (เพื่อ next/prev + Up Next)
   */
  const playProduct = (product, contextQueue = null) => {
    if (!product) return;
    const track = getFirstTrack(product);
    if (!track || !track.audio_file_url) return;

    let playableQueue;
    let idx;
    if (contextQueue && Array.isArray(contextQueue)) {
      playableQueue = contextQueue.filter((p) => getFirstTrack(p));
      idx = playableQueue.findIndex((p) => p._id === product._id);
      if (idx < 0) {
        playableQueue = [product];
        idx = 0;
      }
    } else {
      playableQueue = [product];
      idx = 0;
    }

    setQueue(playableQueue);
    playAtIndex(playableQueue, idx);
  };

  const togglePlay = () => {
    if (!currentProduct) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error("Play failed:", err));
    }
  };

  const playNext = () => {
    if (queue.length === 0 || currentIndex < 0) return;
    const nextIdx = currentIndex + 1;
    if (nextIdx < queue.length) {
      playAtIndex(queue, nextIdx);
    }
  };

  const playPrev = () => {
    if (queue.length === 0 || currentIndex <= 0) return;
    playAtIndex(queue, currentIndex - 1);
  };

  // เล่นเพลงตาม index ที่กดใน Up Next playlist
  const playQueueIndex = (idx) => {
    if (idx >= 0 && idx < queue.length) {
      playAtIndex(queue, idx);
    }
  };

  const seek = (time) => {
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const closePlayer = () => {
    audio.pause();
    audio.currentTime = 0;
    setIsOpen(false);
    setCurrentProduct(null);
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const currentArtist = currentProduct
    ? findArtistById(currentProduct.artist_id)
    : null;

  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;

  const isProductPlaying = (productId) =>
    isPlaying && currentProduct?._id === productId;

  return (
    <AudioPlayerContext.Provider
      value={{
        isOpen, currentProduct, currentArtist,
        queue, currentIndex,
        isPlaying, currentTime, duration, volume, isLoading,
        hasNext, hasPrev,
        playProduct, togglePlay,
        playNext, playPrev, playQueueIndex,
        seek, setVolume, closePlayer,
        isProductPlaying,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx)
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
};

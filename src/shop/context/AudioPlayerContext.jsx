/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/refs */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { findArtistById } from "../data/helpers";
import { getFirstPlayableTrack, getTrackAudioSrc } from "../utils/productShape";

const AudioPlayerContext = createContext(null);
const getFirstTrack = (product) => getFirstPlayableTrack(product);

export function AudioPlayerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;
  }

  const audio = audioRef.current;

  const playAtIndex = (nextQueue, index) => {
    if (!nextQueue || nextQueue.length === 0 || index < 0 || index >= nextQueue.length) return;

    const product = nextQueue[index];
    const track = getFirstTrack(product);
    const audioSrc = getTrackAudioSrc(track);
    if (!audioSrc) return;

    setCurrentProduct(product);
    setCurrentIndex(index);
    setIsOpen(true);

    audio.src = audioSrc;
    audio.load();
    audio.play().catch((err) => console.error("Play failed:", err));
  };

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (event) => {
      console.error("Audio error:", event);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setCurrentIndex((index) => {
        setQueue((currentQueue) => {
          const nextIndex = index + 1;
          if (nextIndex < currentQueue.length) {
            setTimeout(() => playAtIndex(currentQueue, nextIndex), 0);
          } else {
            audio.pause();
            audio.currentTime = 0;
          }
          return currentQueue;
        });
        return index;
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
  }, []);

  useEffect(() => {
    audio.volume = volume;
  }, [volume]);

  const playProduct = (product, contextQueue = null) => {
    if (!product) return;
    const track = getFirstTrack(product);
    if (!getTrackAudioSrc(track)) return;

    let playableQueue;
    let index;
    if (contextQueue && Array.isArray(contextQueue)) {
      playableQueue = contextQueue.filter((item) => getTrackAudioSrc(getFirstTrack(item)));
      index = playableQueue.findIndex((item) => item._id === product._id);
      if (index < 0) {
        playableQueue = [product];
        index = 0;
      }
    } else {
      playableQueue = [product];
      index = 0;
    }

    setQueue(playableQueue);
    playAtIndex(playableQueue, index);
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
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) playAtIndex(queue, nextIndex);
  };

  const playPrev = () => {
    if (queue.length === 0 || currentIndex <= 0) return;
    playAtIndex(queue, currentIndex - 1);
  };

  const playQueueIndex = (index) => {
    if (index >= 0 && index < queue.length) playAtIndex(queue, index);
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

  const currentArtist = currentProduct?.artist || (currentProduct ? findArtistById(currentProduct.artist_id) : null);
  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;
  const isProductPlaying = (productId) => isPlaying && currentProduct?._id === productId;

  return (
    <AudioPlayerContext.Provider
      value={{
        isOpen,
        currentProduct,
        currentArtist,
        queue,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isLoading,
        hasNext,
        hasPrev,
        playProduct,
        togglePlay,
        playNext,
        playPrev,
        playQueueIndex,
        seek,
        setVolume,
        closePlayer,
        isProductPlaying,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return context;
};
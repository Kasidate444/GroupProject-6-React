import { createContext, useContext, useEffect, useRef, useState } from "react";
import trackCover from "../assets/landing-page/cover3.png";
import albumCover1 from "../assets/landing-page/album-cover-1.jpg";
import nowPlayingImg from "../assets/landing-page/radio1.jpg";
import albumCover2 from "../assets/landing-page/album-cover-2.jpg";
import albumCover3 from "../assets/landing-page/album-cover-3.jpg";
import albumCover4 from "../assets/landing-page/album-cover-4.jpg";
import albumCover5 from "../assets/landing-page/album-cover-5.jpg";
import audioSrc from "../assets/track1.mp3";
import track2 from "../assets/track2.mp3.mp3";
import track3 from "../assets/track3.mp3.mp3";
import track4 from "../assets/track4.mp3.mp3";
import track5 from "../assets/track5.mp3.mp3";
import track6 from "../assets/track6.mp3.mp3";
import track7 from "../assets/track7.mp3.mp3";

export const tracks = [
  {
    img: trackCover,
    name: "Crimson Dawn",
    artist: "Old World Vultures",
    desc: "Indie rock single",
    duration: "4:05",
    src: audioSrc,
  },
  {
    img: albumCover1,
    name: "Midnight Echoes",
    artist: "Old World Vultures",
    desc: "Late-night album cut",
    duration: "5:12",
    src: track2,
  },
  {
    img: nowPlayingImg,
    name: "Shadow of the Vulture",
    artist: "Old World Vultures",
    desc: "Live radio preview",
    duration: "4:45",
    src: track3,
  },
  {
    img: albumCover2,
    name: "Neon Drift",
    artist: "Velvet Crows",
    desc: "B-side exclusive",
    duration: "3:58",
    src: track4,
  },
  {
    img: albumCover3,
    name: "Glass Cities",
    artist: "Crystal Mall",
    desc: "Album opener",
    duration: "5:30",
    src: track5,
  },
  {
    img: albumCover4,
    name: "Static Hymn",
    artist: "Static Era",
    desc: "Live session cut",
    duration: "4:22",
    src: track6,
  },
  {
    img: albumCover5,
    name: "Phantom Roads",
    artist: "Bangkok Phantom",
    desc: "Synthwave single",
    duration: "3:47",
    src: track7,
  },
];

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const introRef = useRef(null);
  const [introPlaying, setIntroPlaying] = useState(false);
  const shouldResumeRef = useRef(false);

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const activeTrack = tracks[activeTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    if (shouldResumeRef.current) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      shouldResumeRef.current = false;
    } else {
      setIsPlaying(false);
    }
  }, [activeTrackIndex]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsVisible(true);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const playNext = () => {
    shouldResumeRef.current = isPlaying;
    setActiveTrackIndex((i) => (i + 1) % tracks.length);
  };

  const playPrevious = () => {
    shouldResumeRef.current = isPlaying;
    setActiveTrackIndex((i) => (i === 0 ? tracks.length - 1 : i - 1));
  };

  const closeMiniPlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setIsVisible(false);
  };

  const handleEnded = () => {
    shouldResumeRef.current = true;
    setActiveTrackIndex((i) => (i + 1) % tracks.length);
  };

  const playIntro = (src, { volume: v = 0.7 } = {}) => {
    try {
      // stop previous intro if playing
      if (introRef.current) {
        try {
          introRef.current.pause();
        } catch (e) {}
        introRef.current = null;
      }
      const a = new Audio(src);
      a.volume = Math.max(0, Math.min(1, v));
      a.addEventListener("ended", () => {
        setIntroPlaying(false);
      });
      a.addEventListener("pause", () => {
        setIntroPlaying(false);
      });
      a.play()
        .then(() => {
          setIntroPlaying(true);
        })
        .catch(() => {
          setIntroPlaying(false);
        });
      introRef.current = a;
    } catch (e) {
      // ignore
    }
  };

  const stopIntro = () => {
    if (introRef.current) {
      try {
        introRef.current.pause();
      } catch (e) {}
      introRef.current = null;
      setIntroPlaying(false);
    }
  };

  const selectTrack = (index) => {
    shouldResumeRef.current = false;
    setActiveTrackIndex(index);
  };

  const seekAudio = (event) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    audio.currentTime =
      Math.min(Math.max((event.clientX - left) / width, 0), 1) * audio.duration;
  };

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const updateDuration = () => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    setDuration(audio.duration);
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        activeTrack,
        activeTrackIndex,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        isMuted,
        isVisible,
        togglePlayback,
        playNext,
        playPrevious,
        selectTrack,
        seekAudio,
        setVolume,
        setIsMuted,
        closeMiniPlayer,
        playIntro,
        stopIntro,
        introPlaying,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={activeTrack.src}
        onLoadedMetadata={updateDuration}
        onTimeUpdate={updateProgress}
        onEnded={handleEnded}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import albumCover from "../assets/landing-page/album-cover-1.jpg";
import audioSrc from "../assets/audio.mp3";
import coverPoster from "../assets/landing-page/cover1.jpg";
import trackCover from "../assets/landing-page/cover3.png";
import nowPlayingImg from "../assets/landing-page/radio1.jpg";

const tracks = [
  {
    img: trackCover,
    name: "Crimson Dawn",
    artist: "Old World Vultures",
    desc: "Indie rock single",
    duration: "4:05",
    src: audioSrc,
  },
  {
    img: albumCover,
    name: "Midnight Echoes",
    artist: "Old World Vultures",
    desc: "Late-night album cut",
    duration: "5:12",
    src: audioSrc,
  },
  {
    img: nowPlayingImg,
    name: "Shadow of the Vulture",
    artist: "Old World Vultures",
    desc: "Live radio preview",
    duration: "4:45",
    src: audioSrc,
  },
];

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

export default function RadioPage() {
  const audioRef = useRef(null);
  const shouldResumePlaybackRef = useRef(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);

  const activeTrack = tracks[activeTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const playAudio = () => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    audio.load();

    if (shouldResumePlaybackRef.current) {
      playAudio();
      shouldResumePlaybackRef.current = false;
      return;
    }

    setIsPlaying(false);
  }, [activeTrackIndex]);

  const togglePlayback = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    playAudio();
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

  const seekAudio = (event) => {
    const audio = audioRef.current;

    if (!audio?.duration) return;

    const { left, width } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;
    audio.currentTime = Math.min(Math.max(clickX / width, 0), 1) * audio.duration;
  };

  const selectTrack = (trackIndex) => {
    shouldResumePlaybackRef.current = isPlaying;
    setActiveTrackIndex(trackIndex);
  };

  const playPrevious = () => {
    shouldResumePlaybackRef.current = isPlaying;
    setActiveTrackIndex((currentIndex) =>
      currentIndex === 0 ? tracks.length - 1 : currentIndex - 1,
    );
  };

  const playNext = () => {
    shouldResumePlaybackRef.current = isPlaying;
    setActiveTrackIndex((currentIndex) => (currentIndex + 1) % tracks.length);
  };

  return (
    <main className="min-h-screen bg-[#E7F2EF] px-[10%] py-14 text-slate-900">
      <section className="grid min-h-[620px] grid-cols-[0.95fr_1.25fr] overflow-hidden rounded-lg border border-[#d1cfcf] bg-[#10101e] shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
        <div className="relative min-w-0">
          <img
            className="h-full min-h-[620px] w-full object-cover brightness-[0.68]"
            src={coverPoster}
            alt="The Nightmares Show poster"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <span className="mb-4 inline-flex rounded-full bg-red-500 px-3 py-1 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.08em]">
              Live
            </span>
            <p className="font-['Montserrat',sans-serif] text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
              Audtlist Radio
            </p>
            <h1 className="mt-2 max-w-lg text-[46px] font-bold leading-tight text-white">
              The Nightmares Show
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-white/65">
              A focused radio room for independent releases, late-night cuts,
              and new discoveries from Old World Vultures.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col bg-[#f8fafc]">
          <div className="grid grid-cols-[260px_1fr] gap-8 border-b border-slate-200 p-8">
            <img
              className="aspect-square w-full rounded-lg object-cover shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
              src={activeTrack.img}
              alt={`${activeTrack.name} cover`}
            />
            <div className="flex min-w-0 flex-col justify-between">
              <div>
                <p className="font-['Montserrat',sans-serif] text-xs font-semibold uppercase tracking-[0.1em] text-[#6c63ff]">
                  Now playing
                </p>
                <h2 className="mt-2 text-[34px] font-bold leading-tight text-slate-900">
                  {activeTrack.name}
                </h2>
                <p className="mt-2 text-base text-slate-500">
                  {activeTrack.artist} - {activeTrack.desc}
                </p>
              </div>

              <div className="mt-8">
                <audio
                  ref={audioRef}
                  src={activeTrack.src}
                  onLoadedMetadata={updateDuration}
                  onTimeUpdate={updateProgress}
                  onEnded={playNext}
                />

                <button
                  className="h-3 w-full cursor-pointer overflow-hidden rounded-full border-0 bg-slate-300 p-0"
                  type="button"
                  onClick={seekAudio}
                  aria-label="Seek radio"
                >
                  <span
                    className="block h-full rounded-full bg-[#6c63ff] transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  ></span>
                </button>
                <div className="mt-2 flex justify-between font-['Montserrat',sans-serif] text-xs font-medium text-slate-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-slate-500"
                    type="button"
                    onClick={playPrevious}
                    aria-label="Previous track"
                  >
                    <svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor">
                      <path d="M220-240v-480h60v480h-60Zm520 0L380-480l360-240v480Zm-60-112v-256L488-480l192 128Z" />
                    </svg>
                  </button>
                  <button
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-0 bg-[#6c63ff] text-white shadow-[0_6px_20px_rgba(108,99,255,0.38)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_26px_rgba(108,99,255,0.48)]"
                    type="button"
                    onClick={togglePlayback}
                    aria-label={isPlaying ? "Pause radio" : "Play radio"}
                  >
                    <svg viewBox="0 -960 960 960" width="38" height="38" fill="currentColor">
                      {isPlaying ? (
                        <path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                      ) : (
                        <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                      )}
                    </svg>
                  </button>
                  <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-slate-500"
                    type="button"
                    onClick={playNext}
                    aria-label="Next track"
                  >
                    <svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor">
                      <path d="M680-240v-480h60v480h-60Zm-460 0v-480l360 240-360 240Zm60-112 192-128-192-128v256Z" />
                    </svg>
                  </button>
                  <button
                    className="ml-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-colors duration-150 hover:border-slate-500"
                    type="button"
                    onClick={() => setIsMuted((muted) => !muted)}
                    aria-label={isMuted ? "Unmute radio" : "Mute radio"}
                  >
                    <svg viewBox="0 -960 960 960" width="21" height="21" fill="currentColor">
                      {isMuted ? (
                        <path d="m792-56-96-96q-41 32-91 50.5T500-82v-82q35-8 66.5-21.5T625-221L480-366v126L280-440H120v-240h188L56-932l56-56L848-112l-56 56ZM480-682 376-786l104-104v208Z" />
                      ) : (
                        <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Z" />
                      )}
                    </svg>
                  </button>
                  <input
                    className="h-2 w-32 accent-[#6c63ff]"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(event) => {
                      setVolume(Number(event.target.value));
                      setIsMuted(false);
                    }}
                    aria-label="Radio volume"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-4 p-8">
            {tracks.map((track, index) => {
              const isActive = index === activeTrackIndex;

              return (
                <button
                  className={`flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border bg-white text-left transition-all duration-150 ${
                    isActive
                      ? "border-[#6c63ff]/60 shadow-[0_12px_28px_rgba(108,99,255,0.18)]"
                      : "border-slate-200 hover:-translate-y-1 hover:border-slate-300"
                  }`}
                  key={track.name}
                  type="button"
                  onClick={() => selectTrack(index)}
                >
                  <img
                    className="aspect-video w-full object-cover"
                    src={track.img}
                    alt={`${track.name} cover`}
                  />
                  <span className="p-4">
                    <span className="block text-sm font-bold leading-tight text-slate-900">
                      {track.name}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {track.duration} - {track.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-200 px-8 py-5">
            <Link
              className="font-['Montserrat',sans-serif] text-sm font-semibold text-[#4f46e5] no-underline hover:underline"
              to="/"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

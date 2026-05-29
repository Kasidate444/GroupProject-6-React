import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import albumCover from "../../assets/landing-page/album-cover-1.jpg";
import audioSrc from "../../assets/audio.mp3";
import coverPoster from "../../assets/landing-page/cover1.jpg";
import trackCover from "../../assets/landing-page/cover3.png";
import nowPlayingImg from "../../assets/landing-page/radio1.jpg";

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

function Radio() {
  const audioRef = useRef(null);
  const shouldResumePlaybackRef = useRef(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
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
    shouldResumePlaybackRef.current = false;
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
    <>
      <section className="mx-[10%] mb-6 grid grid-cols-[1.35fr_1fr_1.15fr] overflow-hidden rounded-lg border border-slate-200 bg-[#E7F2EF] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="min-w-0">
          <h2 className="px-4 pb-3 pt-6 font-['Montserrat',sans-serif] text-[28px] font-bold text-slate-900">
            Audtlist Radio
          </h2>
          <Link to="/radio" aria-label="Open The Nightmares Show radio page">
            <img
              className="block aspect-video w-full cursor-pointer object-cover"
              src={coverPoster}
              alt="Nightmares show poster"
            />
          </Link>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <Link
              className="font-['Montserrat',sans-serif] text-sm font-semibold uppercase tracking-[0.04em] text-slate-500 no-underline transition-colors duration-150 hover:text-slate-900 hover:underline"
              to="/radio"
            >
              The Nightmares Show
            </Link>
            <span className="rounded-full bg-red-500 px-3 py-1 font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.08em] text-white">
              Live
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 border-x border-slate-200 p-8">
          <img
            className="block aspect-square w-full rounded-lg object-cover shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]"
            src={activeTrack.img}
            alt={`${activeTrack.name} cover`}
          />

          <div>
            <p className="font-['Montserrat',sans-serif] text-xs font-semibold uppercase tracking-[0.08em] text-[#6c63ff]">
              Now playing
            </p>
            <h3 className="mt-1 text-[21px] font-bold leading-tight text-slate-900">
              {activeTrack.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeTrack.artist} - {activeTrack.desc}
            </p>
          </div>

          <audio
            ref={audioRef}
            src={activeTrack.src}
            onLoadedMetadata={updateDuration}
            onTimeUpdate={updateProgress}
            onEnded={playNext}
          />

          <div>
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
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-slate-500"
              type="button"
              onClick={playPrevious}
              aria-label="Previous track"
            >
              <svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor">
                <path d="M220-240v-480h60v480h-60Zm520 0L380-480l360-240v480Zm-60-112v-256L488-480l192 128Z" />
              </svg>
            </button>
            <button
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-[#6c63ff] text-white shadow-[0_4px_16px_rgba(108,99,255,0.35)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(108,99,255,0.45)]"
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause radio" : "Play radio"}
            >
              <svg viewBox="0 -960 960 960" width="34" height="34" fill="currentColor">
                {isPlaying ? (
                  <path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                ) : (
                  <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                )}
              </svg>
            </button>
            <button
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-slate-500"
              type="button"
              onClick={playNext}
              aria-label="Next track"
            >
              <svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor">
                <path d="M680-240v-480h60v480h-60Zm-460 0v-480l360 240-360 240Zm60-112 192-128-192-128v256Z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-colors duration-150 hover:border-slate-500"
              type="button"
              onClick={() => setIsMuted((muted) => !muted)}
              aria-label={isMuted ? "Unmute radio" : "Mute radio"}
            >
              <svg viewBox="0 -960 960 960" width="21" height="21" fill="currentColor">
                {isMuted ? (
                  <path d="m792-56-96-96q-41 32-91 50.5T500-82v-82q35-8 66.5-21.5T625-221L480-366v126L280-440H120v-240h188L56-932l56-56L848-112l-56 56ZM820-480q0 46-10 89t-28 80l-60-60q9-26 13.5-53t4.5-56q0-83-44.5-151.5T580-729v-83q108 27 174 117t66 215ZM650-480q0-35-18.5-64.5T580-589v-92q72 24 111 80t39 121q0 21-4 41t-12 39l-64-64v-16ZM480-682 376-786l104-104v208Z" />
                ) : (
                  <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z" />
                )}
              </svg>
            </button>
            <input
              className="h-2 w-full accent-[#6c63ff]"
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

        <div className="min-w-0 px-6 py-8 font-['TikTok_Sans','Noto_Sans_Thai',sans-serif]">
          <h2 className="mb-3 font-['Montserrat',sans-serif] text-[28px] font-bold leading-tight text-slate-900">
            Tracklist
          </h2>
          <p className="mb-6 max-w-[40ch] text-sm leading-[1.7] text-slate-500">
            Tune into curated independent releases and switch between radio
            previews without leaving the station.
          </p>
          <Link
            className="mb-6 inline-flex rounded-full bg-[#0a0a1a] px-5 py-2.5 font-['Montserrat',sans-serif] text-sm font-semibold text-white no-underline transition-colors hover:bg-[#4f46e5]"
            to="/radio"
          >
            Open station
          </Link>

          <div className="flex flex-col gap-2">
            {tracks.map((track, index) => {
              const isActive = index === activeTrackIndex;

              return (
                <button
                  className={`flex cursor-pointer flex-row items-center gap-4 rounded-lg border px-2 py-3 text-left transition-all duration-150 ${
                    isActive
                      ? "border-[#6c63ff]/50 bg-white shadow-[0_6px_18px_rgba(108,99,255,0.14)]"
                      : "border-transparent border-b-slate-200 hover:bg-slate-50"
                  }`}
                  key={track.name}
                  type="button"
                  onClick={() => selectTrack(index)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <img
                    className="h-14 w-14 shrink-0 rounded-lg object-cover shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]"
                    src={track.img}
                    alt={`${track.name} cover`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                      {track.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {track.artist} - {track.desc}
                    </p>
                  </div>
                  <span className="shrink-0 font-['Montserrat',sans-serif] text-xs font-semibold text-slate-400">
                    {track.duration}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default Radio;

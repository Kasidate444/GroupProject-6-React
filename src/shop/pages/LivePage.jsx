import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Footer from "../../components/common/Footer";
import { Link, useParams } from "react-router-dom";
import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  TrackLoop,
  TrackRefContext,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Radio, Square, Users } from "lucide-react";
import {
  findLiveById,
  getCurrentLiveTimestamp,
  getLiveElapsedMinutes,
  getViewerCount,
} from "../data/liveHelpers";
import { findArtistById } from "../data/helpers";
import { useAuth } from "../../hooks/useAuth";
import { apiGet, apiPatch, apiPost } from "../../lib/api";
import LiveChat from "../components/LiveChat";
import FollowButton from "../components/FollowButton";

const normalizeLive = (live) => {
  if (!live) return null;
  return {
    ...live,
    _id: live._id || live.id,
    provider: live.provider || "cloudinary_mock",
    started_at: live.started_at || live.startedAt || live.createdAt,
    livekit_room_name: live.livekit_room_name || live.livekitRoomName || live._id || live.id,
  };
};

const getArtist = (live) => {
  if (!live) return null;
  if (live.artist) return live.artist;
  return findArtistById(live.artist_id);
};

const getArtistSlug = (artist) => artist?.slug || artist?.username || artist?._id || "";
const getArtistName = (artist) => artist?.name || artist?.display_name || artist?.username || "Artist";
const getArtistImage = (artist) => artist?.banner_url || artist?.profile_picture_url || artist?.avatar_url || "";

export default function LivePage() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const videoRef = useRef(null);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [liveKitSession, setLiveKitSession] = useState(null);
  const [liveKitError, setLiveKitError] = useState("");
  const [endingLive, setEndingLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLive = async () => {
      setLoading(true);
      setLiveKitSession(null);
      setLiveKitError("");
      try {
        const response = await apiGet(`/lives/${id}`);
        if (!cancelled) setLive(normalizeLive(response.data || response));
      } catch {
        if (!cancelled) setLive(normalizeLive(findLiveById(id)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLive();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const artist = useMemo(() => getArtist(live), [live]);
  const isLiveKit = live?.provider === "livekit";
  const isEnded = live?.status === "ended";
  const wantsHostAccess = Boolean(isLiveKit && isLoggedIn && (user?.role === "admin" || user?.role === "artist"));
  const canPublishLive = Boolean(liveKitSession?.canPublish);

  useEffect(() => {
    if (!isLiveKit || !live || isEnded || !isLoggedIn) return;

    let cancelled = false;
    const joinRoom = async () => {
      try {
        const response = await apiPost("/livekit/token", {
          roomName: live.livekit_room_name,
          mode: wantsHostAccess ? "host" : "viewer",
        });
        if (!cancelled) setLiveKitSession(response.data || response);
      } catch (err) {
        if (!cancelled) setLiveKitError(err.message || "Unable to join live room.");
      }
    };

    joinRoom();

    return () => {
      cancelled = true;
    };
  }, [isEnded, isLiveKit, isLoggedIn, live, wantsHostAccess]);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.volume = volume;
    videoRef.current.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    if (!live || isLiveKit || !videoRef.current) return;
    const video = videoRef.current;

    const handleLoadedMetadata = () => {
      const targetSec = getCurrentLiveTimestamp(live.started_at, video.duration);
      video.currentTime = targetSec;
      video.play().catch(() => {});
    };

    const handlePause = () => {
      setTimeout(() => {
        if (video.paused && !video.ended) video.play().catch(() => {});
      }, 100);
    };

    const handleSeeking = () => {
      const targetSec = getCurrentLiveTimestamp(live.started_at, video.duration);
      if (Math.abs(video.currentTime - targetSec) > 2) video.currentTime = targetSec;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
    };
  }, [isLiveKit, live]);

  useEffect(() => {
    if (!live) return undefined;
    const update = () => {
      setViewerCount(getViewerCount(live._id));
      setElapsedMin(getLiveElapsedMinutes(live.started_at));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [live]);

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    if (muted && volume === 0) setVolume(0.8);
    setMuted((current) => !current);
  };

  const endLive = async () => {
    if (!live || endingLive) return;
    setEndingLive(true);
    setLiveKitError("");
    try {
      const response = await apiPatch(`/lives/${live._id}/end`);
      setLive(normalizeLive(response.data || response));
      setLiveKitSession(null);
    } catch (err) {
      setLiveKitError(err.message || "Unable to end live.");
    } finally {
      setEndingLive(false);
    }
  };

  if (loading) return <LivePageSkeleton />;

  if (!live) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-3 text-2xl text-white/30">404</p>
          <p className="mb-6 text-[15px] text-white/50">Live stream not found</p>
          <Link to="/" className="text-accent hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="px-[5%] py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-[14px] text-white/55 no-underline transition-colors hover:text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to home
        </Link>

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
              {isLiveKit ? (
                <LiveKitStage
                  error={liveKitError}
                  isEnded={isEnded}
                  isLoggedIn={isLoggedIn}
                  session={liveKitSession}
                  onError={setLiveKitError}
                  onDisconnected={() => setLiveKitSession(null)}
                />
              ) : (
                <CloudinaryMockVideo
                  live={live}
                  muted={muted}
                  onContextMenu={(event) => event.preventDefault()}
                  ref={videoRef}
                />
              )}

              <LiveBadge isEnded={isEnded} />
              <ViewerBadge viewerCount={viewerCount} />
              {!isLiveKit && (
                <VolumeControl
                  muted={muted}
                  volume={volume}
                  onToggleMute={toggleMute}
                  onVolumeChange={handleVolumeChange}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
                <div className={`h-full ${isEnded ? "bg-white/35" : "bg-[#E24B4A]"}`} />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <ArtistAvatar artist={artist} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[18px] font-bold leading-tight text-white">{live.title}</h1>
                  {isLiveKit && <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200">LiveKit</span>}
                </div>
                {artist && (
                  <Link
                    to={getArtistSlug(artist) ? `/artist/${getArtistSlug(artist)}` : "#"}
                    className="text-[13px] text-white/55 no-underline transition-colors hover:text-white/85"
                  >
                    {getArtistName(artist)} - Live for {elapsedMin} min
                  </Link>
                )}
              </div>
              {canPublishLive && !isEnded && (
                <button
                  type="button"
                  onClick={endLive}
                  disabled={endingLive}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[12px] font-semibold text-red-200 transition-colors hover:bg-red-400/15 disabled:cursor-wait disabled:opacity-60"
                >
                  <Square className="h-3.5 w-3.5" />
                  {endingLive ? "Ending..." : "End live"}
                </button>
              )}
              {artist && <FollowButton artistId={artist._id} />}
            </div>

            {live.description && (
              <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.04] p-4">
                <p className="text-[13px] leading-relaxed text-white/70">{live.description}</p>
              </div>
            )}
          </div>

          {!canPublishLive && <LiveChat liveId={live._id} />}
        </div>
      </div>
      <Footer simple />
    </div>
  );
}

function LiveKitStage({ error, isEnded, isLoggedIn, session, onDisconnected, onError }) {
  if (isEnded) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <Radio className="h-10 w-10 text-white/20" />
        <h2 className="mt-4 text-lg font-semibold text-white">Live ended</h2>
        <p className="mt-2 max-w-md text-sm text-white/40">This LiveKit session is no longer broadcasting.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <Users className="h-10 w-10 text-white/20" />
        <h2 className="mt-4 text-lg font-semibold text-white">Login required</h2>
        <p className="mt-2 max-w-md text-sm text-white/40">Please log in to join this live room.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <Radio className="h-10 w-10 text-red-300/50" />
        <h2 className="mt-4 text-lg font-semibold text-white">Unable to join live</h2>
        <p className="mt-2 max-w-md text-sm text-red-200/70">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <Radio className="h-10 w-10 animate-pulse text-white/20" />
        <h2 className="mt-4 text-lg font-semibold text-white">Connecting...</h2>
        <p className="mt-2 max-w-md text-sm text-white/40">Joining LiveKit room.</p>
      </div>
    );
  }

  const canPublish = Boolean(session.canPublish);

  return (
    <LiveKitRoom
      token={session.token}
      serverUrl={session.serverUrl}
      connect
      audio={canPublish}
      video={canPublish}
      data-lk-theme="default"
      className="h-full min-h-full"
      onDisconnected={onDisconnected}
      onError={(err) => onError(err.message || "LiveKit connection error.")}
    >
      {canPublish ? <HostLiveExperience /> : <ViewerOnlyExperience />}
      {canPublish && (
        <div className="pointer-events-none absolute left-4 top-14 rounded-md bg-black/55 px-3 py-1.5 text-[12px] font-semibold text-white/75 backdrop-blur-sm">
          Host mode
        </div>
      )}
    </LiveKitRoom>
  );
}

function HostLiveExperience() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <div className="relative h-full min-h-full">
      <RoomAudioRenderer />
      {tracks.length > 0 ? (
        <div className="grid h-full min-h-full grid-cols-1 gap-2 pb-20">
          <TrackLoop tracks={tracks}>
            <BroadcastVideoTile />
          </TrackLoop>
        </div>
      ) : (
        <div className="flex h-full min-h-full flex-col items-center justify-center px-6 pb-20 text-center">
          <Radio className="h-10 w-10 text-white/20" />
          <h2 className="mt-4 text-lg font-semibold text-white">Ready to broadcast</h2>
          <p className="mt-2 max-w-md text-sm text-white/40">
            Turn on camera, microphone, or screen share from the controls below.
          </p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/75 px-3 py-2 backdrop-blur-md">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            chat: false,
            settings: true,
            leave: true,
          }}
        />
      </div>
    </div>
  );
}

function ViewerOnlyExperience() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  return (
    <div className="relative h-full min-h-full">
      <RoomAudioRenderer />
      {tracks.length > 0 ? (
        <div className="grid h-full min-h-full grid-cols-1 gap-2">
          <TrackLoop tracks={tracks}>
            <BroadcastVideoTile />
          </TrackLoop>
        </div>
      ) : (
        <div className="flex h-full min-h-full flex-col items-center justify-center px-6 text-center">
          <Radio className="h-10 w-10 animate-pulse text-white/20" />
          <h2 className="mt-4 text-lg font-semibold text-white">Waiting for artist</h2>
          <p className="mt-2 max-w-md text-sm text-white/40">
            You are in viewer mode. The stream will appear here when the artist publishes camera or screen share.
          </p>
        </div>
      )}
    </div>
  );
}

function BroadcastVideoTile() {
  return (
    <TrackRefContext.Consumer>
      {(trackRef) => (
        trackRef ? (
          <div className="h-full min-h-full overflow-hidden bg-black">
            <VideoTrack trackRef={trackRef} className="h-full w-full object-contain" />
          </div>
        ) : null
      )}
    </TrackRefContext.Consumer>
  );
}

const CloudinaryMockVideo = forwardRef(function CloudinaryMockVideo({ live, muted, onContextMenu }, ref) {
  return (
    <video
      ref={ref}
      src={live.video_url}
      autoPlay
      muted={muted}
      playsInline
      loop
      className="h-full w-full object-cover"
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      onContextMenu={onContextMenu}
    />
  );
});

function LiveBadge({ isEnded }) {
  return (
    <div className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-md px-3 py-1.5 shadow-lg ${isEnded ? "bg-white/15" : "bg-[#E24B4A]"}`}>
      {!isEnded && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
      )}
      <span className="text-[12px] font-bold tracking-wider text-white">{isEnded ? "ENDED" : "LIVE"}</span>
    </div>
  );
}

function ViewerBadge({ viewerCount }) {
  return (
    <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md bg-black/70 px-3 py-1.5 backdrop-blur-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="text-[12px] font-medium tabular-nums text-white">{viewerCount.toLocaleString()} watching</span>
    </div>
  );
}

function VolumeControl({ muted, volume, onToggleMute, onVolumeChange }) {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
      <button onClick={onToggleMute} className="shrink-0 text-white transition-colors hover:text-white/70" aria-label={muted ? "Unmute" : "Mute"}>
        {muted || volume === 0 ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={muted ? 0 : volume}
        onChange={onVolumeChange}
        className="w-20 cursor-pointer accent-white"
        aria-label="Volume"
      />
    </div>
  );
}

function ArtistAvatar({ artist }) {
  const image = getArtistImage(artist);
  const slug = getArtistSlug(artist);
  return (
    <Link to={slug ? `/artist/${slug}` : "#"} className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg-card no-underline">
      {image ? (
        <img src={image} alt={getArtistName(artist)} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/30">?</div>
      )}
    </Link>
  );
}

function LivePageSkeleton() {
  return (
    <div className="min-h-screen bg-bg px-[5%] py-8">
      <div className="mb-6 h-5 w-32 animate-pulse rounded bg-white/10" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="aspect-video animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="mt-4 flex gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-64 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-40 animate-pulse rounded bg-white/8" />
            </div>
          </div>
        </div>
        <div className="h-[520px] w-full animate-pulse rounded-xl bg-white/[0.04] lg:w-80" />
      </div>
    </div>
  );
}

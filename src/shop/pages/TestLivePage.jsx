import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Radio, Users, Video } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiPost } from "../../lib/api";

const normalizeRoomName = (value) => (
  String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
);

const getDefaultRoomName = (user) => {
  const userKey = user?._id || user?.user_Id || user?.id || user?.username || "audtlist";
  return normalizeRoomName(`audtlist-test-${userKey}`) || "audtlist-test-live";
};

export default function TestLivePage() {
  const { user, isLoggedIn, authLoading } = useAuth();
  const [roomName, setRoomName] = useState("");
  const [session, setSession] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const effectiveRoomName = useMemo(() => (
    normalizeRoomName(roomName) || getDefaultRoomName(user)
  ), [roomName, user]);

  if (authLoading) return <TestLiveSkeleton />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const joinLive = async (mode) => {
    setJoining(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await apiPost("/livekit/token", {
        roomName: effectiveRoomName,
        mode,
      });
      const data = response.data || response;
      setSession(data);
      setStatusMessage(
        data.mode === mode
          ? `Joined ${data.roomName} as ${data.mode}.`
          : `Backend allowed viewer mode for this account. Joined ${data.roomName} as viewer.`,
      );
    } catch (err) {
      setSession(null);
      setError(err.message || "Unable to join live room.");
    } finally {
      setJoining(false);
    }
  };

  const leaveLive = () => {
    setSession(null);
    setStatusMessage("Disconnected from room.");
  };

  return (
    <main className="min-h-screen bg-bg px-[5%] py-10 font-['Plus_Jakarta_Sans',sans-serif] text-white md:px-[10%]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-300">
              <Radio className="h-4 w-4" />
              LiveKit test room
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Test Live</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
              Open this page in two browsers. Join as host from an artist/admin account, then join the same room as viewer from a user account.
            </p>
          </div>
          <span className="w-fit rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/45">
            Role: {user?.role || "user"}
          </span>
        </div>

        <section className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Room name</span>
            <input
              type="text"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder={getDefaultRoomName(user)}
              disabled={Boolean(session)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <button
            type="button"
            onClick={() => joinLive("host")}
            disabled={joining || Boolean(session)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Video className="h-4 w-4" />
            Join as host
          </button>
          <button
            type="button"
            onClick={() => joinLive("viewer")}
            disabled={joining || Boolean(session)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Users className="h-4 w-4" />
            Join as viewer
          </button>
          <button
            type="button"
            onClick={leaveLive}
            disabled={!session}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/55 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
          >
            Leave
          </button>
        </section>

        {(statusMessage || error) && (
          <p className={`mb-4 rounded-lg border px-4 py-3 text-sm ${error ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-green-400/20 bg-green-400/10 text-green-200"}`}>
            {error || statusMessage}
          </p>
        )}

        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#111827]">
          {session ? (
            <LiveKitRoom
              token={session.token}
              serverUrl={session.serverUrl}
              connect
              audio={session.canPublish}
              video={session.canPublish}
              data-lk-theme="default"
              className="min-h-[70vh]"
              onDisconnected={leaveLive}
              onError={(err) => setError(err.message || "LiveKit connection error.")}
            >
              <VideoConference />
            </LiveKitRoom>
          ) : (
            <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
              <Radio className="h-10 w-10 text-white/20" />
              <h2 className="mt-4 text-lg font-semibold">Not connected</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/40">
                Join a room to publish camera/mic as host or watch as viewer.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function TestLiveSkeleton() {
  return (
    <main className="min-h-screen bg-bg px-[5%] py-10 md:px-[10%]">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-20 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="h-[60vh] animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
      </div>
    </main>
  );
}

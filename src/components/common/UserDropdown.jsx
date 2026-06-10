import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

const normalizeRole = (value) => String(value || "").trim().toLowerCase();

const getUserRole = (user) => {
  const storedSession = readStoredSession();
  return normalizeRole(
    user?.role ||
      user?.user_type ||
      user?.type ||
      user?.user?.role ||
      user?.data?.role ||
      storedSession?.role ||
      storedSession?.user_type ||
      storedSession?.type ||
      storedSession?.user?.role ||
      storedSession?.data?.role,
  );
};

const roleConfig = {
  artist: {
    label: "Artist",
    helper: "Studio tools enabled",
    actionLabel: "Open Artist Studio",
    actionTo: "/artist",
    actionDetail: "Upload releases, manage merch, and view sales",
    badgeClass: "border-[#fc3c44]/30 bg-[#fc3c44]/12 text-[#ff7278]",
    dotClass: "bg-[#fc3c44]",
  },
  admin: {
    label: "Admin",
    helper: "Admin controls enabled",
    actionLabel: "Open Admin Dashboard",
    actionTo: "/admin",
    actionDetail: "Manage platform data and operations",
    badgeClass: "border-[#9d6dff]/35 bg-[#6c63ff]/16 text-[#b89cff]",
    dotClass: "bg-[#9d6dff]",
  },
  listener: {
    label: "Listener",
    helper: "Fan account",
    actionLabel: "View Collection",
    actionTo: "/profile",
    actionDetail: "Wishlist, follows, and purchased music",
    badgeClass: "border-white/15 bg-white/[0.07] text-white/65",
    dotClass: "bg-white/55",
  },
};

const getRoleConfig = (role) => {
  if (["admin", "administrator"].includes(role)) return roleConfig.admin;
  if (role === "artist") return roleConfig.artist;
  return roleConfig.listener;
};

const getProfileImageUrl = (user) =>
  user?.profile_picture?.url ||
  user?.profile?.profile_picture?.url ||
  user?.data?.profile_picture?.url ||
  user?.profile_picture_url ||
  user?.profile?.profile_picture_url ||
  user?.data?.profile_picture_url ||
  user?.avatar_url ||
  user?.profile?.avatar_url ||
  user?.data?.avatar_url ||
  user?.image_url ||
  user?.profile?.image_url ||
  user?.photo_url ||
  user?.picture ||
  "";

function MenuIcon({ children }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white/55">
      {children}
    </span>
  );
}

export default function UserDropdown({ user, handleLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedRole = getUserRole(user);
  const config = getRoleConfig(normalizedRole);
  const profileImageUrl = getProfileImageUrl(user);
  const isArtist = normalizedRole === "artist";
  const avatarButtonClass = isArtist
    ? "border-[#fc3c44]/65 bg-[#fc3c44]/10 shadow-[0_0_0_3px_rgba(252,60,68,0.12)] hover:border-[#ff7278] hover:bg-[#fc3c44]/16"
    : "border-white/20 bg-white/10 hover:bg-white/15";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border text-white/75 transition-all hover:text-white ${avatarButtonClass}`}
        aria-label="Open account menu"
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={user?.username || user?.email || "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="material-symbols-outlined text-white/70"
            style={{ fontSize: "22px" }}
          >
            person
          </span>
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#070711] ${config.dotClass}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-white/10 bg-[#141420]/95 shadow-xl backdrop-blur-md"
          style={{ animation: "dropIn 0.15s ease-out forwards" }}
        >
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/85 font-['Plus_Jakarta_Sans',sans-serif]">
                  {user?.username || user?.email}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/35 font-['Plus_Jakarta_Sans',sans-serif]">
                  {user?.email}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${config.badgeClass}`}>
                {config.label}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/40">{config.helper}</p>
          </div>

          <div className="p-2">
            <Link
              to={config.actionTo}
              onClick={() => setOpen(false)}
              className="mb-1 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-3 no-underline transition-colors hover:border-white/20 hover:bg-white/[0.09]"
            >
              <MenuIcon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </MenuIcon>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{config.actionLabel}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/38">{config.actionDetail}</span>
              </span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 no-underline transition-colors hover:bg-white/5 hover:text-white"
            >
              <MenuIcon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </MenuIcon>
              Profile
            </Link>

            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 no-underline transition-colors hover:bg-white/5 hover:text-white"
            >
              <MenuIcon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </MenuIcon>
              Orders
            </Link>

            <Link
              to="/profilesetting"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 no-underline transition-colors hover:bg-white/5 hover:text-white"
            >
              <MenuIcon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </MenuIcon>
              Settings
            </Link>

            <Link
              to="/help"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 no-underline transition-colors hover:bg-white/5 hover:text-white"
            >
              <MenuIcon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </MenuIcon>
              Help
            </Link>

            <div className="mx-2 my-1.5 border-t border-white/10" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <MenuIcon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </MenuIcon>
              <span className="font-semibold tracking-[0.04em]">Log out</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}

import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import SearchBar from "./SearchBar.jsx";
import logoA from "../../assets/landing-page/logoa.png";
import introArtist from "../../assets/intro_artist2_sound.mp3";
import { useAudio } from "../../contexts/AudioContext";
import { CartContext } from "../../shop/context/CartContext";
import UserDropdown from "./UserDropdown.jsx";

export default function Head() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const cart = useContext(CartContext);
  const isArtist =
    isLoggedIn && (user?.role === "artist" || Boolean(user?.artistName));
  const isFan = isLoggedIn && !isArtist;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const audio = useAudio();

  const handleFanClick = () => {
    navigate("/profile");
  };

  const handleArtistClick = () => {
    try {
      audio?.playIntro?.(introArtist, { volume: 0.7 });
    } catch (e) {}
    navigate("/artist");
  };

  return (
    <nav className="sticky top-0 z-100 flex h-17 items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 backdrop-blur-xl md:gap-6 md:px-[10%]">
      <div className="flex shrink-0 cursor-pointer items-center gap-2 text-white transition-opacity duration-150 hover:opacity-75">
        <Link to="/">
          <img
            src={logoA}
            alt="AUDTLIST"
            className="h-16 w-auto object-contain md:h-24"
          />
        </Link>
      </div>
      <div className="relative z-[110] mr-auto hidden max-w-[420px] flex-1 sm:block">
        <SearchBar />
      </div>
      {/* Auth buttons */}
      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        {isArtist && (
          <button
            type="button"
            onClick={handleArtistClick}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-all hover:bg-white/15 md:mr-1 cursor-pointer ${audio?.introPlaying ? "ring-2 ring-accent" : ""}`}
            title="Go to artist dashboard"
            aria-label="Go to artist dashboard"
          >
            <span aria-hidden="true" className="text-lg">
              🎸
            </span>
            <span className="sr-only">
              Artist guitar icon - Go to artist dashboard
            </span>
          </button>
        )}
        {isFan && (
          <button
            type="button"
            onClick={handleFanClick}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-all hover:bg-white/15 md:mr-1 cursor-pointer ${audio?.introPlaying ? "ring-2 ring-accent" : ""}`}
            title="Go to profile"
            aria-label="Go to profile"
          >
            <span aria-hidden="true" className="text-lg">
              🎧
            </span>
            <span className="sr-only">Fan headphone icon - Go to profile</span>
          </button>
        )}
        {cart && (
          <button
            onClick={() => cart.setOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition-all hover:bg-white/15 hover:text-white"
            aria-label="Open cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-accent px-1 text-[11px] font-bold text-white">
                {cart.totalItems > 99 ? "99+" : cart.totalItems}
              </span>
            )}
          </button>
        )}
        {isLoggedIn ? (
          <UserDropdown user={user} handleLogout={handleLogout} />
        ) : (
          <>
            <Link
              to="/login"
              className="cursor-pointer rounded-full border-[1.5px] border-white/40 bg-transparent px-4 py-1.5 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold tracking-[0.04em] text-white no-underline transition-all duration-200 hover:border-white/80 hover:bg-red-500/10 md:px-6 md:py-2"
            >
              Log in
            </Link>
            <Link
              to="/register/fan"
              className="cursor-pointer rounded-full border-0 bg-linear-to-br from-[#8a8abe] to-[#0d0d99] px-3 py-1.5 font-['Plus_Jakarta_Sans',sans-serif] text-xs font-semibold tracking-[0.04em] text-white no-underline shadow-[0_4px_16px_rgba(0,0,180,0.45)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(248,248,250,0.45)] md:px-6 md:py-2 md:text-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

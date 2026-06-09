import { useFollow } from "../../contexts/FollowContext";
import { useAuth } from "../../hooks/useAuth";

export default function FollowButton({ artistId, size = "md", variant = "outline" }) {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow();
  const following = isFollowing(artistId);
  const isOwnArtistProfile = user?.role === "artist" && String(user?._id || "") === String(artistId || "");

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnArtistProfile) return;
    toggleFollow(artistId);
  };

  const sizeClasses = {
    sm: "text-[12px] px-3 py-1.5 gap-1",
    md: "text-[14px] px-4 py-2 gap-1.5",
  };
  const iconSize = size === "sm" ? 13 : 15;

  const styleClasses = isOwnArtistProfile
    ? "bg-white/[0.04] text-white/30 border border-white/10 cursor-not-allowed"
    : following
      ? "bg-[#fc3c44] text-white border border-[#fc3c44] hover:bg-[#e8333b]"
      : variant === "solid"
        ? "bg-white text-black border border-white hover:bg-white/90"
        : "bg-transparent text-white/85 border border-white/30 hover:border-white/60 hover:text-white";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOwnArtistProfile}
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all ${isOwnArtistProfile ? "" : "active:scale-95"} ${sizeClasses[size]} ${styleClasses}`}
      aria-label={isOwnArtistProfile ? "This is your artist profile" : following ? "Unfollow artist" : "Follow artist"}
      title={isOwnArtistProfile ? "This is your artist profile" : undefined}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={following && !isOwnArtistProfile ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isOwnArtistProfile ? "Your profile" : following ? "Following" : "Follow"}
    </button>
  );
}
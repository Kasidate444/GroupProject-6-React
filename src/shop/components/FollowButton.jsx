import { useFollow } from "../../contexts/FollowContext";

export default function FollowButton({ artistId, size = "md", variant = "outline" }) {
  const { isFollowing, toggleFollow } = useFollow();
  const following = isFollowing(artistId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow(artistId);
  };

  const sizeClasses = {
    sm: "text-[12px] px-3 py-1.5 gap-1",
    md: "text-[14px] px-4 py-2 gap-1.5",
  };
  const iconSize = size === "sm" ? 13 : 15;

  const styleClasses = following
    ? "bg-[#fc3c44] text-white border border-[#fc3c44] hover:bg-[#e8333b]"
    : variant === "solid"
      ? "bg-white text-black border border-white hover:bg-white/90"
      : "bg-transparent text-white/85 border border-white/30 hover:border-white/60 hover:text-white";

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95 ${sizeClasses[size]} ${styleClasses}`}
      aria-label={following ? "Unfollow artist" : "Follow artist"}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={following ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {following ? "Following" : "Follow"}
    </button>
  );
}

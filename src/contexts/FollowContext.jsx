import { createContext, useContext, useState } from "react";

const FollowContext = createContext(null);

export function FollowProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem("followedArtists");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFollow = (artistId) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(artistId)) {
        next.delete(artistId);
      } else {
        next.add(artistId);
      }
      localStorage.setItem("followedArtists", JSON.stringify([...next]));
      return next;
    });
  };

  const isFollowing = (artistId) => ids.has(artistId);
  const followedArtistIds = [...ids];
  const followCount = ids.size;

  return (
    <FollowContext.Provider
      value={{ toggleFollow, isFollowing, followedArtistIds, followCount }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}

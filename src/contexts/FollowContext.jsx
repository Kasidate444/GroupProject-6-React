import { createContext, useCallback, useContext, useState } from "react";
import { apiRequest } from "../lib/api";

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

  const setLocalFollow = (artistId, followed) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (followed) {
        next.add(artistId);
      } else {
        next.delete(artistId);
      }
      localStorage.setItem("followedArtists", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleFollow = async (artistId) => {
    const nextFollowed = !ids.has(artistId);
    setLocalFollow(artistId, nextFollowed);

    try {
      const result = await apiRequest(`/artists/${artistId}/follow`, { method: "PATCH" });
      if (typeof result.followed === "boolean") {
        setLocalFollow(artistId, result.followed);
      }
    } catch (err) {
      setLocalFollow(artistId, !nextFollowed);
      throw err;
    }
  };

  const isFollowing = (artistId) => ids.has(artistId);
  const followedArtistIds = [...ids];
  const followCount = ids.size;
  const setFollowedArtists = useCallback((artistIds = []) => {
    const next = new Set(artistIds.filter(Boolean));
    localStorage.setItem("followedArtists", JSON.stringify([...next]));
    setIds(next);
  }, []);

  return (
    <FollowContext.Provider
      value={{ toggleFollow, isFollowing, followedArtistIds, followCount, setFollowedArtists }}
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

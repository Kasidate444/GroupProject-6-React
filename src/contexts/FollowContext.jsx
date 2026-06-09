/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiPatch } from "../lib/api";

const FollowContext = createContext(null);

const persistFollowedArtists = (next) => {
  localStorage.setItem("followedArtists", JSON.stringify([...next]));
  return next;
};

export function FollowProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem("followedArtists");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const setFollowedArtists = useCallback((artistIds = []) => {
    setIds(persistFollowedArtists(new Set(artistIds.filter(Boolean))));
  }, []);

  const setLocalFollow = useCallback((artistId, followed) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (followed) next.add(artistId);
      else next.delete(artistId);
      return persistFollowedArtists(next);
    });
  }, []);

  const toggleFollow = useCallback(async (artistId) => {
    if (!artistId) return;

    let wasFollowing = false;
    setIds((prev) => {
      wasFollowing = prev.has(artistId);
      const next = new Set(prev);
      if (wasFollowing) next.delete(artistId);
      else next.add(artistId);
      return persistFollowedArtists(next);
    });

    try {
      const result = await apiPatch(`/artists/${artistId}/follow`);
      if (typeof result.followed === "boolean") {
        setLocalFollow(artistId, result.followed);
      }
    } catch (error) {
      setLocalFollow(artistId, wasFollowing);
      throw error;
    }
  }, [setLocalFollow]);

  const value = useMemo(() => {
    const followedArtistIds = [...ids];
    return {
      toggleFollow,
      isFollowing: (artistId) => ids.has(artistId),
      followedArtistIds,
      followCount: ids.size,
      setFollowedArtists,
    };
  }, [ids, setFollowedArtists, toggleFollow]);

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}
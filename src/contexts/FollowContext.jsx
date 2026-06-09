/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { apiPatch } from "../lib/api";

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

  const persist = (next) => {
    localStorage.setItem("followedArtists", JSON.stringify([...next]));
    return next;
  };

  const setFollowedArtists = (artistIds = []) => {
    setIds(persist(new Set(artistIds.filter(Boolean))));
  };

  const setLocalFollow = (artistId, followed) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (followed) next.add(artistId);
      else next.delete(artistId);
      return persist(next);
    });
  };

  const toggleFollow = async (artistId) => {
    if (!artistId) return;
    const wasFollowing = ids.has(artistId);
    setLocalFollow(artistId, !wasFollowing);

    try {
      const result = await apiPatch(`/artists/${artistId}/follow`);
      if (typeof result.followed === "boolean") {
        setLocalFollow(artistId, result.followed);
      }
    } catch (error) {
      setLocalFollow(artistId, wasFollowing);
      throw error;
    }
  };

  const isFollowing = (artistId) => ids.has(artistId);
  const followedArtistIds = [...ids];
  const followCount = ids.size;

  return (
    <FollowContext.Provider value={{ toggleFollow, isFollowing, followedArtistIds, followCount, setFollowedArtists }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}

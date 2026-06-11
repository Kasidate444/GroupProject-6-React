/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem("collection");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const addToCollection = (productIds) => {
    setIds((prev) => {
      const next = new Set(prev);
      productIds.forEach((id) => { if (id) next.add(id); });
      localStorage.setItem("collection", JSON.stringify([...next]));
      return next;
    });
  };

  const collectionIds = [...ids];

  return (
    <CollectionContext.Provider value={{ addToCollection, collectionIds }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useCollection must be used within CollectionProvider");
  return ctx;
}

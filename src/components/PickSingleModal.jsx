import { useState, useEffect } from "react";
import { products } from "../shop/data/mockDb/products";
import { tracks } from "../shop/data/mockDb/tracks";
import { getMySingles, formatDuration } from "../shop/data/mySingles";

export default function PickSingleModal({ isOpen, onClose, onPick, excludeIds = [] }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) { setSelectedIds(new Set()); setSearch(""); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allSingles = getMySingles(products, tracks);
  const filtered = allSingles.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (trackId) => {
    if (excludeIds.includes(trackId)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const handleConfirm = () => {
    const picked = allSingles.filter((s) => selectedIds.has(s.track_id));
    onPick(picked);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[520px] max-w-full bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-2xl flex flex-col max-h-[80vh]"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <h3 className="text-white text-[15px] font-semibold m-0">Pick from your singles</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="px-5 py-3 border-b border-white/[0.06] shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your singles..."
            className="w-full px-3 py-2 rounded-md bg-white/[0.04] border border-white/[0.08] focus:border-white/25 outline-none text-white text-[13px] transition-colors"
          />
        </div>

        <div className="px-3 py-2 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-center text-white/40 text-[13px] py-8">
              {search ? "No matching singles" : "You have no singles yet"}
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((single) => {
                const isInTracklist = excludeIds.includes(single.track_id);
                const isSelected = selectedIds.has(single.track_id);
                return (
                  <li key={single.track_id}>
                    <button
                      type="button"
                      onClick={() => toggleSelect(single.track_id)}
                      disabled={isInTracklist}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
                        ${isInTracklist ? "opacity-40 cursor-not-allowed" : "hover:bg-white/[0.04]"}
                        ${isSelected ? "bg-[#fc3c44]/15 hover:bg-[#fc3c44]/20" : ""}
                      `}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-[#fc3c44] border-[#fc3c44]" : "border-white/30"}`}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="w-9 h-9 rounded bg-bg-card overflow-hidden shrink-0">
                        {single.cover_url && <img src={single.cover_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px] truncate">{single.title}</p>
                        {isInTracklist && <p className="text-[10px] text-white/40">Already in tracklist</p>}
                      </div>
                      <span className="text-white/40 text-[11px] tabular-nums shrink-0">{formatDuration(single.duration)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 px-5 py-3 border-t border-white/[0.06] bg-black/20 shrink-0">
          <span className="text-[12px] text-white/45">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-[12px] font-medium text-white/65 hover:text-white border border-white/15 hover:border-white/30 rounded-md transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#fc3c44] hover:bg-[#e8333b] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Selected ({selectedIds.size})
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

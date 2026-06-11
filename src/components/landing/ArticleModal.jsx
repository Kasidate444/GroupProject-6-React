import { useEffect, useState } from "react";

export default function ArticleModal({ article, isOpen, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6 transition-opacity duration-200 ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className={`relative z-10 w-full max-w-195 max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-3xl md:rounded-2xl bg-[#0d0d1c] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.7)] transition-all duration-220 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/60 backdrop-blur-sm transition-all duration-150 hover:bg-white/10 hover:text-white"
          aria-label="Close article"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <img
          className="block w-full aspect-video object-cover rounded-t-3xl md:rounded-t-2xl"
          src={article.img}
          alt={article.title}
        />

        <div className="px-6 py-7 md:px-10 md:py-9">
          <p className="mb-3 font-['Plus_Jakarta_Sans',sans-serif] text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
            {article.date}
          </p>
          <h2 className="mb-6 text-[22px] font-bold leading-tight text-white md:text-[30px]">
            {article.title}
          </h2>
          <div className="space-y-4">
            {article.body.map((para, i) => (
              <p key={i} className="text-base leading-[1.8] text-white/60">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

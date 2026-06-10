import { useEffect, useRef } from "react";

// =============================================================================
// UPLOAD MODAL — Modal wrapper กลาง (ใช้ซ้ำได้ Single/Album/Merch)
// =============================================================================
// Props:
//   isOpen       — เปิด/ปิด modal
//   onClose      — function ปิด modal (เรียกตอนกด X / overlay / Esc / Cancel)
//   title        — ชื่อ modal เช่น "Upload Single"
//   icon         — emoji/symbol ก่อนชื่อ
//   width        — กว้าง modal (default 600px)
//   children     — เนื้อหา (ฟอร์ม)
//   footer       — ปุ่ม (Cancel + Submit)
// =============================================================================

export default function UploadModal({
  isOpen,
  onClose,
  title,
  icon = "♪",
  width = 600,
  children,
  footer,
  closeOnOverlayClick = true,
}) {
  // ปิด modal เฉพาะตอนที่ mousedown และ click เกิดขึ้นบน overlay จริง ๆ
  // (กันกรณีลากเลือกข้อความใน input/textarea แล้วปล่อยเมาส์นอกกรอบ ทำให้ modal ปิดและข้อมูลหาย)
  const mouseDownOnOverlay = useRef(false);

  // ── กด Esc เพื่อปิด ──
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    // lock scroll หลัง modal เปิด (กันเลื่อนหน้าหลัง)
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e) => {
    mouseDownOnOverlay.current = e.target === e.currentTarget;
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && mouseDownOnOverlay.current) {
      onClose();
    }
    mouseDownOnOverlay.current = false;
  };

  return (
    // Overlay
    <div
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      {/* Modal box — กดในนี้ไม่ปิด */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: `${width}px`, maxWidth: "100%" }}
        className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-[18px] border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-white text-[20px] leading-none">{icon}</span>
            <h3 className="text-white text-[16px] font-semibold m-0">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Body — scrollable */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/[0.06] bg-black/20 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Animation note (ใส่ใน tailwind.config.js หรือ global CSS):
//
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
//   .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
// =============================================================================

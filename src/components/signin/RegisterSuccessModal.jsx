const MESSAGES = {
  fan: "Your fan account is ready. Log in to start exploring music, supporting artists, and building your collection.",
  artist: "Your artist account is ready. Log in to start uploading music, merch, and connecting with your fans.",
};

export default function RegisterSuccessModal({ open, role = "fan", onGoLogin }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#141414] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#22c55e] text-[#22c55e]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="mb-2 font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white">
          Welcome to AUDTLIST!
        </h2>
        <p className="mb-10 text-[13px] leading-relaxed text-white/55">
          {MESSAGES[role] || MESSAGES.fan}
        </p>
        <button
          type="button"
          onClick={onGoLogin}
          className="mt-4 w-full rounded-lg bg-linear-to-br from-[#8a8abe] to-[#0d0d99] py-3 text-[15px] font-semibold text-white shadow-[0_10px_26px_rgba(13,13,153,0.24)] transition-all hover:brightness-110"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

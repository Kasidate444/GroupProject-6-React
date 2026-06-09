import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";
import Nav from "../components/common/Nav";
import headclub from "../assets/landing-page/headclub.png";
import { clubs } from "../data/clubs";

export default function ClubPage() {
  return (
    <div className="min-h-screen bg-[#03030f] font-['Plus_Jakarta_Sans',sans-serif] text-white">
      <Nav />
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/8 px-[5%] py-10 md:px-[10%] md:py-16"
        style={{ background: "linear-gradient(135deg, #0d0d2e 0%, #1a0a2e 50%, #0a0a1a 100%)" }}
      >
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full opacity-30"
          style={{ background: "#9d6dff", filter: "blur(80px)" }} />
        <div className="pointer-events-none absolute right-[20%] top-4 h-48 w-48 rounded-full opacity-20"
          style={{ background: "#fc3c44", filter: "blur(60px)" }} />

        {/* Head decoration */}
        <img
          src={headclub}
          alt=""
          className="pointer-events-none absolute right-0 top-1/2 h-48 w-48 -translate-y-1/2 object-contain opacity-30 md:right-[13%] md:h-192 md:w-3xl md:opacity-100"
        />

        <div className="relative z-10">
          <p className="mb-3 font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
            Audtlist
          </p>
          <h1 className="mb-4 font-['Plus_Jakarta_Sans',sans-serif] text-[48px] font-extrabold tracking-tight"
            style={{ background: "linear-gradient(90deg, #fff 0%, #c8b4ff 60%, #fc3c44 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Community
          </h1>
          <p className="max-w-lg font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-normal leading-[1.8] text-white/60">
            Subscribe-to-own music discovery, curated by trusted experts and
            rooted in community. A new way to collect music that matters.
          </p>
        </div>
      </div>

      {/* Club list */}
      <div className="flex flex-col gap-0">
        {clubs.map((club, i) => {
          const reversed = i % 2 !== 0;
          return (
            <div
              key={club.id}
              className={`mx-[5%] my-5 flex flex-col overflow-hidden rounded-2xl border border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.4)] md:mx-[7%] md:my-7 md:flex-row ${reversed && "md:flex-row-reverse"}`}
            >
              {/* Image */}
              <div className="relative h-56 w-full shrink-0 overflow-hidden flex items-center justify-center md:h-auto md:w-[44%]"
                style={{ background: club.accent + "18" }}
              >
                <img
                  src={club.img}
                  alt={club.title}
                  className="w-full h-full object-contain brightness-110 saturate-[1.2]"
                />
              </div>

              {/* Text */}
              <div className="flex flex-1 flex-col justify-center gap-4 bg-[#0c0c1e] px-6 py-8 md:px-12 md:py-10">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[24px] font-extrabold leading-[1.25] tracking-tight text-white">
                  {club.title}
                </h2>

                <div className="flex flex-col gap-3">
                  {club.desc.split("\n\n").map((para, j) => (
                    <p
                      key={j}
                      className="font-['Plus_Jakarta_Sans',sans-serif] text-[13.5px] font-normal leading-[1.85] text-white/45"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[12.5px] font-medium italic leading-relaxed text-white/30">
                  — {club.tagline}
                </p>

                {club.id === 1 ? (
                  <Link
                    to={`/club/${club.id}`}
                    className="mt-1 w-fit rounded-full px-6 py-2.5 font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold tracking-wide text-white no-underline transition-transform hover:scale-105"
                    style={{ background: "#fc3c44" }}
                  >
                    Explore club →
                  </Link>
                ) : (
                  <span
                    className="mt-1 w-fit cursor-default rounded-full px-6 py-2.5 font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold tracking-wide text-white"
                    style={{ background: "#fc3c44" }}
                  >
                    Explore club →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}

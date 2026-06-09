import { Link, useParams } from "react-router-dom";
import Footer from "../components/common/Footer";
import Nav from "../components/common/Nav";
import collabImg from "../assets/landing-page/cxa.jpg";
import creativeMarketLogo from "../assets/landing-page/creative-market-logo.svg";
import barImg from "../assets/landing-page/bar.png";
import { clubs } from "../data/clubs";

export default function ClubDetailPage() {
  const { id } = useParams();
  const club = clubs.find((c) => String(c.id) === id);

  if (!club) {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center bg-[#03030f] px-[10%] text-white">
        <p className="mb-4 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
          404
        </p>
        <h1 className="mb-4 text-[44px] font-bold leading-tight">Club not found</h1>
        <Link
          to="/club"
          className="rounded-full bg-[#6c63ff] px-6 py-3 font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold text-white no-underline transition-colors hover:bg-[#4f46e5]"
        >
          ← Back to community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03030f] font-['Plus_Jakarta_Sans',sans-serif] text-white">
      <Nav />

      <img
        src={barImg}
        alt=""
        aria-hidden="true"
        className="h-10 w-full object-cover"
      />

      {/* Hero */}
      <div
        className="relative overflow-hidden border-b border-white/8 px-[5%] py-14 md:px-[10%] md:py-20"
        style={{ background: "linear-gradient(135deg, #0d0d2e 0%, #1a0a2e 50%, #0a0a1a 100%)" }}
      >
        <div
          className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full opacity-30"
          style={{ background: club.accent, filter: "blur(80px)" }}
        />

        <img
          src={creativeMarketLogo}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-[5%] w-72 opacity-10 md:left-[10%] md:w-118"
        />

        <img
          src={club.img}
          alt={club.title}
          className="pointer-events-none absolute right-0 top-1/2 hidden h-137 w-137 -translate-y-1/2 object-contain opacity-90 md:right-[8%] md:block"
        />

        <div className="relative z-10">
          <h1 className="mb-4 max-w-2xl font-['Plus_Jakarta_Sans',sans-serif] text-[40px] font-extrabold leading-tight tracking-tight md:text-[52px]">
            {club.title}
          </h1>
          <p className="max-w-xl font-['Plus_Jakarta_Sans',sans-serif] text-[12.5px] font-medium italic leading-relaxed text-white/40">
            — {club.tagline}
          </p>
        </div>
      </div>

      <img
        src={barImg}
        alt=""
        aria-hidden="true"
        className="h-10 w-full object-cover"
      />

      {/* About */}
      <div className="mx-[5%] my-10 flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#0c0c1e] p-6 md:mx-[10%] md:my-14 md:p-10">
        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[20px] font-extrabold tracking-tight text-white">
          About this club
        </h2>
        {club.desc.split("\n\n").map((para, j) => (
          <p
            key={j}
            className="font-['Plus_Jakarta_Sans',sans-serif] text-[13.5px] font-normal leading-[1.85] text-white/45"
          >
            {para}
          </p>
        ))}
      </div>

      {/* Community collab banner — featuring cxa.jpg */}
      <div className="mx-[5%] mb-12 md:mx-[10%] md:mb-16">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0c0c1e]">
          <img
            src={collabImg}
            alt="Creative Market x Audtlist — We build and support artist community together"
            className="w-full object-cover"
          />
          <div className="flex flex-col gap-2 px-6 py-8 md:px-12 md:py-10">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[18px] font-extrabold tracking-tight text-white">
              Built through collaboration, grown by community
            </h3>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[13.5px] font-normal leading-[1.85] text-white/45">
              Creative Market x Audtlist is where two creative communities
              meet — makers, crate diggers, and listeners coming together to
              support local artists and grow the scene from the ground up.
              This club is proof that the best things are still built by
              people, not algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="mx-[5%] mb-16 flex flex-col items-start gap-4 rounded-2xl border border-white/8 px-6 py-10 md:mx-[10%] md:px-12"
        style={{ background: `linear-gradient(135deg, ${club.accent}1a 0%, transparent 70%)` }}
      >
        <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[20px] font-extrabold tracking-tight text-white">
          Ready to explore the Creative Market x Audtlist collab?
        </h3>
        <p className="max-w-lg font-['Plus_Jakarta_Sans',sans-serif] text-[13.5px] leading-[1.8] text-white/45">
          Step into the world where sound meets craft — discover limited
          drops, artist collaborations, and exclusive pieces from Creative
          Market, made in the spirit of DJ Joe Buddha Club.
        </p>
        <a
          href="https://creative-market-front-end-sprint-2-mu.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-fit rounded-full px-6 py-2.5 font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold tracking-wide text-white no-underline transition-transform hover:scale-105"
          style={{ background: club.accent }}
        >
          Visit Creative Market →
        </a>
      </div>

      <Footer />
    </div>
  );
}

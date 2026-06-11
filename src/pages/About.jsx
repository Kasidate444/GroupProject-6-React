import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";
import aboutusImg from "../assets/aboutus3.png";
import thaweeratchImg from "../assets/Thaweeratch.jpg";
import mataImg from "../assets/O.png";
import kohImg from "../assets/koh.png";
import winnerImg from "../assets/winner.png";
import ongImg from "../assets/ong.png";
import myImg from "../assets/my.png";
import aboutus2Img from "../assets/aboutus2.png";

const stats = [
  { value: "1,200+", label: "Independent Artists" },
  { value: "5,000+", label: "Tracks Available" },
  { value: "1 Year", label: "Supporting Local Music" },
  { value: "Bangkok", label: "& Beyond" },
];

const team = [
  {
    name: "Akkarawin Suchaichit",
    role: "Tech leader & Co-Founder",
    bio: "ใครก็ไม่รู้ที่เดินผ่านทางมา.",
    avatar: winnerImg,
  },
  {
    name: "Jinvaramas Piklunklin",
    role: "Product lead & Co-Founder",
    bio: "Full-stack engineer obsessed with audio. Built the first version of the player in a weekend, hasn't slept properly since love.",
    avatar: myImg,
    zoom: true,
  },
  {
    name: "Kasidate Sae-eaw",
    role: "Tech agile coach",
    bio: "Worked with independent labels across Southeast Asia for a decade. Knows every artist personally — or almost.",
    avatar: ongImg,
  },
  {
    name: "Thaweeratch Khongrachata",
    role: "Product designer",
    bio: "Obsessed with dark UIs and good typography. Thinks the best interface is the one that gets out of the music's way.",
    avatar: thaweeratchImg,
  },
  {
    name: "Mata Chobmee",
    role: "Backend engineer",
    bio: "Keeps the servers running and the money flowing. If you see a smooth checkout, you can thank him.",
    avatar: mataImg,
  },
  {
    name: "Piyawat Kamton",
    role: "Team coordinator",
    bio: "Immensely organized and somehow keeps us all on track. If you email support, there's a good chance you'll hear back from him.",
    avatar: kohImg,
  },
];

const values = [
  {
    icon: "🎵",
    title: "Artists First",
    body: "Every product decision starts with one question: does this help the artist? We take a smaller cut so creators keep more of what they make.",
    bg: "",
  },
  {
    icon: "🔊",
    title: "Hear Before You Buy",
    body: "Music is something you feel, not read about. Every release on Audtlist comes with previews so you know exactly what you're supporting.",
    bg: "",
  },
  {
    icon: "📦",
    title: "Own It for Real",
    body: "Vinyl, CDs, merch — things you can hold. We believe physical music carries meaning that streams can't replicate.",
    bg: "",
  },
  {
    icon: "🌏",
    title: "Local Scenes, Global Reach",
    body: "Born in Bangkok, loved everywhere. We spotlight Southeast Asian artists while making it easy for the world to find them.",
    bg: "",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Hero */}
      <section className="relative overflow-hidden px-[5%] pt-16 pb-12 md:px-[10%] md:pt-24 md:pb-20">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-16 items-center">
          <div className="relative">
            <p className="text-accent text-[13px] font-semibold tracking-[0.12em] uppercase mb-5">
              Our story
            </p>
            <h1 className="text-white text-[36px] font-bold leading-[1.05] tracking-tight mb-8 md:text-[56px]">
              Built for artists.
              <br />
              <span className="text-white/35">Loved by listeners.</span>
            </h1>
            <p className="text-white/55 text-[16px] leading-[1.8] max-w-md">
              Audtlist started as a simple frustration — independent musicians
              were spending years making music only to hand the majority of
              every sale to a platform that didn't know their name. We built
              something different.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <img
              src={aboutusImg}
              alt="Built for artists"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-[5%] py-10 border-y border-white/8 md:px-[10%] md:py-14">
        <div className="flex flex-wrap gap-x-16 gap-y-8">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-3">
              <span className="text-accent text-[42px] font-extrabold leading-none">
                {s.value}
              </span>
              <span className="text-white/40 text-[13px] uppercase tracking-widest">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-[5%] py-12 md:px-[10%] md:py-24">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-white text-[28px] font-bold leading-[1.15] mb-8 md:text-[38px]">
              Music should sustain
              <br />
              <em className="not-italic text-white/40">
                the people who make it.
              </em>
              <br />
              <span className="text-[16px] font-extrabold tracking-widest text-accent uppercase not-italic">
                team-6-kamui-jenkins
              </span>
            </h2>
            <div className="w-12 h-px bg-accent mb-8" />
            <p className="text-white/55 text-[15px] leading-[1.9] mb-5">
              Streaming pays fractions of a cent per play. We offer a
              marketplace where fans buy directly — downloads, vinyl, merch —
              and artists keep 90% of every transaction.
            </p>
            <p className="text-white/40 text-[14px] leading-[1.9]">
              No algorithms deciding who gets heard. No label gatekeeping. Just
              music, money back to creators, and a community that actually
              cares.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img
              src={aboutus2Img}
              alt="Audtlist mission"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-[5%] py-12 bg-bg-dark border-y border-white/8 md:px-[10%] md:py-20">
        <p className="text-accent text-[13px] font-semibold tracking-[0.12em] uppercase mb-4">
          What we believe
        </p>
        <h2 className="text-white text-[32px] font-bold mb-16">Our values</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-white/8 lg:grid-cols-4">
          {values.map((v, i) => (
            <div key={v.title} className="group px-0 sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <p className="text-white/20 text-[48px] font-bold leading-none mb-6 group-hover:text-accent/40 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-white font-semibold text-[16px] mb-3">
                {v.title}
              </h3>
              <p className="text-white/45 text-[13px] leading-relaxed">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="px-[5%] py-12 md:px-[10%] md:py-20">
        <p className="text-accent text-[13px] font-semibold tracking-[0.12em] uppercase mb-4">
          The team
        </p>
        <h2 className="text-white text-[32px] font-bold mb-[20%]">
          People behind the music
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="group relative bg-bg-card rounded-2xl p-6 border border-white/8 overflow-hidden cursor-default"
            >
              <div className="w-full aspect-square rounded-xl mb-4 overflow-hidden ring-2 ring-accent/40">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${member.zoom ? "scale-110" : ""}`}
                />
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-0.5">
                {member.name}
              </h3>
              <p className="text-accent text-[12px] font-medium">
                {member.role}
              </p>
              {/* Bio overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-bg-card/95 backdrop-blur-sm flex flex-col justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-accent/20">
                <div className="w-8 h-px bg-accent mb-3" />
                <h3 className="text-white font-semibold text-[14px] mb-0.5">
                  {member.name}
                </h3>
                <p className="text-accent text-[11px] font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-white/65 text-[12px] leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-[5%] my-10 rounded-2xl bg-[#141420] border border-white/8 px-6 py-10 md:mx-[10%] md:my-16 md:px-12 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-white text-[36px] font-bold leading-tight mb-3">
              Ready to explore?
            </h2>
            <p className="text-white/45 text-[14px] max-w-sm leading-relaxed">
              Every purchase goes directly to the artist. No label, no
              middleman.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/shop"
              className="px-7 py-3.5 rounded-full bg-accent text-white font-semibold text-[14px] hover:bg-accent-hover transition-all no-underline shadow-[0_4px_20px_rgba(252,60,68,0.3)]"
            >
              Browse Music
            </Link>
            <a
              href="mailto:hello@audtlist.com"
              className="px-7 py-3.5 rounded-full border border-white/20 text-white/70 font-semibold text-[14px] hover:border-white/40 hover:text-white transition-all no-underline"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
      <Footer simple />
    </div>
  );
}

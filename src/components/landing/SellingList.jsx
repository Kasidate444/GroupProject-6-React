import { Link } from "react-router-dom";

const sellingItems = [
  { slug: "crimson-dawn",       cover: "/covers/coversong-01.jpg", title: "Crimson Dawn",       artist: "Old World Vultures", price: 30 },
  { slug: "midnight-echoes",    cover: "/covers/coversong-02.jpg", title: "Midnight Echoes",    artist: "Old World Vultures", price: 250 },
  { slug: "hollow-bones",       cover: "/covers/coversong-04.jpg", title: "Hollow Bones",       artist: "Velvet Crows",       price: 25 },
  { slug: "cigarette-burns",    cover: "/covers/coversong-05.jpg", title: "Cigarette Burns",    artist: "Velvet Crows",       price: 30 },
  { slug: "static-lights",      cover: "/covers/coversong-06.jpg", title: "Static Lights",      artist: "Velvet Crows",       price: 30 },
  { slug: "rust-on-velvet",     cover: "/covers/coversong-07.jpg", title: "Rust on Velvet",     artist: "Velvet Crows",       price: 25 },
  { slug: "slow-dance-goodbye", cover: "/covers/coversong-08.jpg", title: "Slow Dance Goodbye", artist: "Velvet Crows",       price: 35 },
  { slug: "feather-and-glass",  cover: "/covers/coversong-09.jpg", title: "Feather and Glass",  artist: "Velvet Crows",       price: 30 },
  { slug: "honey-dont-stay",    cover: "/covers/coversong-10.jpg", title: "Honey, Don't Stay",  artist: "Velvet Crows",       price: 25 },
  { slug: "coal-eyes",          cover: "/covers/coversong-11.jpg", title: "Coal Eyes",          artist: "Velvet Crows",       price: 40 },
];

function ItemRow({ hidden = false }) {
  return (
    <div
      className="flex shrink-0 animate-[marquee_30s_linear_infinite] flex-row items-center gap-4 pr-4"
      aria-hidden={hidden}
    >
      {sellingItems.map((item, i) => (
        <Link
          key={`${item.slug}-${hidden}-${i}`}
          to={`/product/${item.slug}`}
          className="group relative flex w-40 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#141420] no-underline transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="relative overflow-hidden">
            <img
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={item.cover}
              alt={hidden ? "" : item.title}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="flex flex-col gap-0.5 p-3">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold leading-tight text-white">
              {item.title}
            </p>
            <p className="text-[11px] text-white/40">{item.artist}</p>
            <p className="mt-2 text-sm font-bold text-white">฿{item.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function SellingList() {
  return (
    <section>
      <div className="flex items-baseline gap-4 bg-[#03030f] px-[5%] pb-4 pt-8 after:h-px after:flex-1 after:bg-linear-to-r after:from-white/15 after:to-transparent after:content-[''] md:px-[10%]">
        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[20px] font-extrabold uppercase text-white md:text-[28px]">
          Selling right now
        </h2>
      </div>

      <div className="flex h-80 overflow-hidden bg-[#03030f] pb-6 hover:[&>div]:[animation-play-state:paused]">
        <ItemRow />
        <ItemRow hidden />
      </div>
    </section>
  );
}

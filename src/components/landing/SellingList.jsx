import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../lib/api";
import { formatPrice } from "../../shop/data/helpers";
import { getArtistName } from "../../shop/utils/productShape";

function ItemRow({ items, hidden = false }) {
  return (
    <div
      className="flex shrink-0 animate-[marquee_30s_linear_infinite] flex-row items-center gap-4 pr-4"
      aria-hidden={hidden}
    >
      {items.map((item, index) => (
        <Link
          key={`${item._id || item.slug}-${hidden}-${index}`}
          to={`/product/${item.slug || item._id}`}
          className="group relative flex w-40 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#141420] no-underline transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="relative overflow-hidden">
            <img
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={item.cover_url}
              alt={hidden ? "" : item.title}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="flex flex-col gap-0.5 p-3">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm font-semibold leading-tight text-white">
              {item.title}
            </p>
            <p className="text-[11px] text-white/40">{getArtistName(item)}</p>
            <p className="mt-2 text-sm font-bold text-white">{formatPrice(item.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SkeletonRow({ hidden = false }) {
  return (
    <div
      className="flex shrink-0 animate-[marquee_30s_linear_infinite] flex-row items-center gap-4 pr-4"
      aria-hidden={hidden}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`${hidden}-${index}`}
          className="flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#141420]"
        >
          <div className="aspect-square w-full animate-pulse bg-white/8" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/8" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SellingList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSellingItems = async () => {
      try {
        const response = await apiGet("/products?limit=10&sort=newest");
        if (!active) return;
        setItems(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load selling products:", error);
        if (active) {
          setItems([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadSellingItems();

    return () => {
      active = false;
    };
  }, []);

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-baseline gap-4 bg-[#03030f] px-[5%] pb-4 pt-8 after:h-px after:flex-1 after:bg-linear-to-r after:from-white/15 after:to-transparent after:content-[''] md:px-[10%]">
        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[20px] font-extrabold uppercase text-white md:text-[28px]">
          Selling right now
        </h2>
      </div>

      <div className="flex h-80 overflow-hidden bg-[#03030f] pb-6 hover:[&>div]:[animation-play-state:paused]">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow hidden />
          </>
        ) : (
          <>
            <ItemRow items={items} />
            <ItemRow items={items} hidden />
          </>
        )}
      </div>
    </section>
  );
}

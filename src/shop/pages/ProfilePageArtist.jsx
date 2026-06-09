import { useRef, useState } from "react";
import { useFulfillment } from "../../contexts/FulfillmentContext";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { artists, orders, products, users } from "../data/mockDb";
import { getProductsByArtist } from "../data/helpers";
import UploadModal from "../../components/UploadModal";
import UploadSingleForm from "../../components/UploadSingleForm";
import UploadAlbumForm from "../../components/UploadAlbumForm";
import UploadMerchForm from "../../components/UploadMerchForm";

export default function ProfilePageArtist() {
  const { user, isLoggedIn } = useAuth();
  const currentArtist =
    artists.find((artist) => artist.user_id === user?._id) || artists[0];
  const artistProducts = getProductsByArtist(currentArtist?._id);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [isMerchOpen, setIsMerchOpen] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(
    () => localStorage.getItem("artistBannerUrl") || currentArtist?.banner_url || "",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem("artistAvatarUrl") || "",
  );

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: "Orders" },
    { key: "fans", label: "Fans" },
    { key: "merch", label: "Merch" },
    { key: "album", label: "Album" },
    { key: "single", label: "Single" },
  ];

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      if (type === "banner") {
        setBannerUrl(url);
        localStorage.setItem("artistBannerUrl", url);
      } else {
        setAvatarUrl(url);
        localStorage.setItem("artistAvatarUrl", url);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredProducts = artistProducts.filter((p) => {
    if (activeTab === "album") return p.type === "album";
    if (activeTab === "single") return p.type === "single";
    if (activeTab === "merch") return p.type === "merch";
    return true;
  });

  return (
    <div className="min-h-screen bg-bg font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Banner ── */}
      <div
        className="relative h-80 bg-cover bg-center cursor-pointer group overflow-hidden"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : { background: "#141414" }}
        onClick={() => bannerInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[12px] px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Change banner
          </span>
        </div>
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "banner")} />
      </div>

      {/* ── Profile header ── */}
      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <div className="flex flex-col gap-4 items-start md:flex-row md:items-end md:gap-6">

          {/* Avatar */}
          <div
            className="relative w-36 h-36 shrink-0 rounded-full overflow-hidden bg-bg-card ring-4 ring-bg shadow-2xl cursor-pointer group"
            onClick={() => avatarInputRef.current?.click()}
          >
            <img
              src={avatarUrl || currentArtist?.banner_url}
              alt={currentArtist?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "avatar")} />
          </div>

          {/* Info */}
          <div className="flex-1 pb-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Artist
            </span>
            <h1 className="text-white text-[2.2rem] font-bold tracking-tight leading-none truncate">
              {currentArtist?.name || user?.display_name || user?.email}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {currentArtist?.location && (
                <span className="text-white/40 text-[13px] flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {currentArtist.location}
                </span>
              )}
              <span className="text-white/15">·</span>
              <span className="text-white/40 text-[13px]">{currentArtist?.bio?.slice(0, 60)}{(currentArtist?.bio?.length ?? 0) > 60 ? "…" : ""}</span>
            </div>
          </div>

          {/* Upload button */}
          <div className="relative pb-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowUploadMenu((v) => !v)}
              className="rounded-full bg-accent hover:bg-accent-hover transition-all duration-200 inline-flex items-center overflow-hidden shadow-lg hover:shadow-accent/30"
            >
              <span className="flex items-center gap-2.5 pl-6 pr-4 py-3.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span className="text-[14px] font-bold text-white tracking-wide">Upload new</span>
              </span>
              <span className="w-px h-6 bg-white/20 self-center" />
              <span className="px-4 py-3.5 flex items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {showUploadMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUploadMenu(false)} />
                <div className="absolute right-0 top-full mt-2 z-20 w-44 bg-bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  {[
                    { label: "Single", icon: "♪", action: () => { setShowUploadMenu(false); setIsSingleOpen(true); } },
                    { label: "Album", icon: "◐", action: () => { setShowUploadMenu(false); setIsAlbumOpen(true); } },
                    { label: "Merch", icon: "✦", action: () => { setShowUploadMenu(false); setIsMerchOpen(true); } },
                  ].map((item, i) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className={`w-full text-left px-4 py-3 text-[13px] text-white/75 hover:bg-white/[0.06] hover:text-white transition-colors flex items-center gap-2.5 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
                    >
                      <span>{item.icon}</span> {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-8 px-[5%] md:px-[10%]">
        <div className="flex items-center gap-0.5 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-accent text-white"
                  : "border-transparent text-white/40 hover:text-white/65"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "overview" ? (
            <ArtistOverview
              artist={currentArtist}
              onShowFans={() => setActiveTab("fans")}
              onShowOrders={() => setActiveTab("orders")}
            />
          ) : activeTab === "orders" ? (
            <OrdersList artistId={currentArtist?._id} />
          ) : activeTab === "fans" ? (
            <FansList artistId={currentArtist?._id} />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>

      <UploadModal isOpen={isSingleOpen} onClose={() => setIsSingleOpen(false)} title="Upload Single" icon="♪">
        <UploadSingleForm onCancel={() => setIsSingleOpen(false)} onSuccess={() => setIsSingleOpen(false)} />
      </UploadModal>
      <UploadModal isOpen={isAlbumOpen} onClose={() => setIsAlbumOpen(false)} title="Upload Album" icon="◐" width={640}>
        <UploadAlbumForm onCancel={() => setIsAlbumOpen(false)} onSuccess={() => setIsAlbumOpen(false)} />
      </UploadModal>
      <UploadModal isOpen={isMerchOpen} onClose={() => setIsMerchOpen(false)} title="Upload Merch" icon="✦" width={680}>
        <UploadMerchForm onCancel={() => setIsMerchOpen(false)} onSuccess={() => setIsMerchOpen(false)} />
      </UploadModal>
    </div>
  );
}

function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="py-12">
        <p className="text-white/35 text-[14px]">No products here yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
      {products.map((product) => (
        <Link key={product._id} to={`/product/${product.slug}`} className="flex flex-col gap-2 no-underline group">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
            <img
              src={product.cover_url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-white/85 text-[13px] font-medium truncate group-hover:text-white transition-colors">
              {product.title}
            </p>
            <p className="text-white/35 text-[11px] capitalize">{product.type}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

const PLATFORM_FEE = 0.10;

function ArtistOverview({ artist, onShowFans, onShowOrders }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const artistId = artist?._id;

  const now = new Date();
  const cutoff = new Date(now.getTime() - Number(timeRange) * 24 * 60 * 60 * 1000);

  const allArtistOrders = orders.filter((o) =>
    o.items.some((i) => i.artist_id === artistId),
  );
  const artistOrders = allArtistOrders.filter((o) => new Date(o.created_at) >= cutoff);

  const totalRevenue = artistOrders.reduce((sum, o) =>
    sum + o.items.filter((i) => i.artist_id === artistId)
      .reduce((s, i) => s + i.unit_price * (i.quantity || 1), 0), 0);

  const fanMap = {};
  artistOrders.forEach((o) => {
    const items = o.items.filter((i) => i.artist_id === artistId);
    if (!items.length) return;
    fanMap[o.user_id] = fanMap[o.user_id] || { purchases: 0, lastPurchase: null };
    fanMap[o.user_id].purchases += items.reduce((s, i) => s + (i.quantity || 1), 0);
    const d = new Date(o.created_at);
    if (!fanMap[o.user_id].lastPurchase || d > fanMap[o.user_id].lastPurchase)
      fanMap[o.user_id].lastPurchase = d;
  });

  const fanEntries = Object.keys(fanMap)
    .map((uid) => {
      const u = users.find((x) => x._id === uid) || { display_name: uid, email: "" };
      return { user: u, purchases: fanMap[uid].purchases, lastPurchase: fanMap[uid].lastPurchase };
    })
    .sort((a, b) => b.purchases - a.purchases);

  const fanCount = fanEntries.length;
  const ordersCount = artistOrders.length;
  const netRevenue = Math.round(totalRevenue * (1 - PLATFORM_FEE));
  const payoutBalance = artist?.payout_balance ?? 0;

  const handleWithdraw = () => {
    setShowWithdraw(false);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3500);
  };

  // Chart — date-bucketed over selected range
  const chartLength = 26;
  const rangeMs = now - cutoff || 1;
  const windowMs = rangeMs / chartLength;
  const chartValues = Array.from({ length: chartLength }, (_, i) => {
    const t = i / (chartLength - 1);
    const pointDate = new Date(cutoff.getTime() + t * rangeMs);
    return artistOrders
      .filter((o) => Math.abs(new Date(o.created_at) - pointDate) < windowMs)
      .reduce((s, o) => s + o.items.filter((i) => i.artist_id === artistId)
        .reduce((si, i) => si + i.unit_price * (i.quantity || 1), 0), 0);
  });
  const maxChartValue = Math.max(...chartValues, 1);
  const chartPoints = chartValues
    .map((v, i) => `${(i / (chartLength - 1)) * 100},${100 - Math.round((v / maxChartValue) * 65 + 15)}`)
    .join(" ");
  const chartArea = `0,100 ${chartPoints} 100,100`;

  const orderMix = artistOrders.reduce((mix, o) => {
    o.items.forEach((i) => {
      if (i.artist_id !== artistId) return;
      const rev = i.unit_price * (i.quantity || 1);
      const p = products.find((p) => p._id === i.product_id);
      if (p?.type === "merch") mix.merch += rev;
      else if (p?.type === "single" || p?.type === "album") mix.digital += rev;
      else mix.bundle += rev;
    });
    return mix;
  }, { digital: 0, merch: 0, bundle: 0 });

  const totalMix = orderMix.digital + orderMix.merch + orderMix.bundle || 1;
  const digitalPct = Math.round((orderMix.digital / totalMix) * 100);
  const merchPct = Math.round((orderMix.merch / totalMix) * 100);
  const bundlePct = 100 - digitalPct - merchPct;

  const orderMixData = [
    { color: "#ffd700", label: "Digital", value: digitalPct },
    { color: "#fc3c44", label: "Merch", value: merchPct },
    { color: "#00d9ff", label: "Bundle", value: bundlePct },
  ];

  const pieStyle = {
    background: `conic-gradient(#ffd700 0% ${digitalPct}%, #fc3c44 ${digitalPct}% ${digitalPct + merchPct}%, #00d9ff ${digitalPct + merchPct}% 100%)`,
  };

  const timeGreeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="text-white space-y-3">

      {/* ── Dashboard header card ── */}
      <div className="rounded-2xl border border-white/10 bg-bg-card px-6 py-5 flex items-center justify-between gap-6">
        <div>
          <p className="text-[12px] text-white/35">{timeGreeting} · {dateStr}</p>
          <h2 className="text-[22px] font-bold text-white mt-0.5">{artist?.name}</h2>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-9 rounded-full border border-white/10 bg-bg px-4 text-[13px] font-medium text-white/60 outline-none cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="1">Last 1 day</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/35">Total Earnings</p>
            <p className="text-[22px] font-bold text-white tabular-nums mt-0.5">฿{netRevenue.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/35">Available</p>
            <p className="text-[22px] font-bold text-[#4ade80] tabular-nums mt-0.5">฿{payoutBalance.toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowWithdraw(true)}
            disabled={payoutBalance === 0}
            className="rounded-full bg-[#4ade80] px-5 py-2 text-[13px] font-semibold text-[#0a1a0a] hover:bg-[#22c55e] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: `Last ${timeRange} ${timeRange === "1" ? "day" : "days"}`, value: `฿${netRevenue.toLocaleString()}`, sub: "after 10% fee" },
          { label: "Orders", value: String(ordersCount), sub: "total orders", onClick: onShowOrders },
          { label: "Fans", value: String(fanCount), sub: "unique buyers", onClick: onShowFans },
          { label: "Platform fee", value: "10%", sub: "per transaction" },
        ].map(({ label, value, sub, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            className={`rounded-xl border border-white/10 bg-bg-card px-4 py-4 ${onClick ? "cursor-pointer hover:border-white/20 transition-colors" : ""}`}
          >
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{label}</p>
            <p className="text-[24px] font-bold leading-none tracking-tight text-white mt-2.5">{value}</p>
            <p className="mt-1.5 text-[11px] text-white/25">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-3">

        {/* Revenue chart */}
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Revenue</p>
              <h3 className="text-[15px] font-semibold text-white mt-0.5">Last {timeRange} {timeRange === "1" ? "day" : "days"}</h3>
            </div>
            <span className="text-[11px] font-medium text-white/25 bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-full">THB</span>
          </div>
          <div className="relative h-[130px]">
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[9px] text-white/20 pointer-events-none w-8">
              <span>{Math.ceil(maxChartValue)}</span>
              <span>{Math.ceil(maxChartValue * 0.5)}</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-y-0 left-8 right-0 h-full w-[calc(100%-2rem)]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fc3c44" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fc3c44" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />
              ))}
              <polygon points={chartArea} fill="url(#revFill)" />
              <polyline points={chartPoints} fill="none" stroke="#fc3c44" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Order mix */}
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Breakdown</p>
          <h3 className="text-[15px] font-semibold text-white mt-0.5 mb-5">Order mix</h3>
          <div className="flex items-center gap-5">
            <div className="h-[88px] w-[88px] rounded-full grid place-items-center shrink-0" style={pieStyle}>
              <div className="h-[44px] w-[44px] rounded-full bg-bg-card" />
            </div>
            <div className="space-y-2.5 flex-1">
              {orderMixData.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] text-white/45">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white tabular-nums">{item.value}%</span>
                  </div>
                  <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 2-col: Recent sales + Top fans ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Recent sales */}
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Activity</p>
              <h3 className="text-[15px] font-semibold text-white mt-0.5">Recent sales</h3>
            </div>
            <button type="button" onClick={onShowOrders} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
              See all →
            </button>
          </div>
          <div className="space-y-1">
            {artistOrders.slice(0, 5).map((order) => {
              const myItems = order.items.filter((i) => i.artist_id === artistId);
              const amount = myItems.reduce((s, i) => s + i.unit_price * (i.quantity || 1), 0);
              const firstTitle = myItems[0]?.title_snapshot ?? "—";
              const extra = myItems.length > 1 ? ` +${myItems.length - 1}` : "";
              const buyer = users.find((u) => u._id === order.user_id);
              const buyerName = buyer?.display_name || buyer?.username || "Unknown";
              return (
                <div key={order._id} className="flex items-center justify-between py-2.5 rounded-xl px-3 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/40 shrink-0">
                      {buyerName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-white/75 truncate group-hover:text-white/90 transition-colors">{firstTitle}{extra}</p>
                      <p className="text-[10px] text-white/30">{buyerName}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold text-white tabular-nums shrink-0 ml-3">฿{amount.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top fans */}
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Community</p>
              <h3 className="text-[15px] font-semibold text-white mt-0.5">Top fans</h3>
            </div>
            <button type="button" onClick={onShowFans} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
              See all {fanCount} →
            </button>
          </div>
          {fanEntries.length === 0 ? (
            <p className="text-[13px] text-white/25 pt-2">No fans yet.</p>
          ) : (
          <div className="space-y-1">
            {fanEntries.slice(0, 5).map(({ user, purchases, lastPurchase }, i) => (
              <div key={user._id} className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <span className={`text-[10px] w-3 shrink-0 tabular-nums font-bold ${i === 0 ? "text-brand-gold" : "text-white/20"}`}>{i + 1}</span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-brand-gold/10 border-brand-gold/30 text-brand-gold" : "bg-white/[0.07] border-white/10 text-white/45"}`}>
                  {(user.display_name || user.username || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white/80 truncate">{user.display_name || user.username}</p>
                  <p className="text-[10px] text-white/30">{lastPurchase?.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                </div>
                <p className="text-[12px] font-semibold text-white tabular-nums shrink-0">{purchases}×</p>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {withdrawSuccess && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-bg-card border border-white/10 px-5 py-3 shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span className="text-[13px] text-white/80">Withdrawal requested — arrives in 3–5 business days.</span>
        </div>
      )}

      {showWithdraw && (
        <WithdrawModal
          balance={payoutBalance}
          method={artist?.payout_method}
          onConfirm={handleWithdraw}
          onCancel={() => setShowWithdraw(false)}
        />
      )}
    </section>
  );
}

function FansList({ artistId }) {
  const map = {};
  orders.forEach((o) => {
    const items = o.items.filter((i) => i.artist_id === artistId);
    if (!items.length) return;
    map[o.user_id] = map[o.user_id] || { purchases: 0, last: null };
    map[o.user_id].purchases += items.reduce((s, i) => s + (i.quantity || 1), 0);
    const d = new Date(o.created_at);
    if (!map[o.user_id].last || d > map[o.user_id].last) map[o.user_id].last = d;
  });

  const fanEntries = Object.keys(map).map((uid) => {
    const u = users.find((x) => x._id === uid) || { display_name: uid, email: "" };
    return { user: u, purchases: map[uid].purchases, last: map[uid].last };
  });

  if (fanEntries.length === 0) {
    return <div className="py-12 text-white/35 text-[14px]">No fans yet — no purchases found.</div>;
  }

  return (
    <div className="space-y-2">
      {fanEntries.map(({ user, purchases, last }) => (
        <div
          key={user._id}
          className="rounded-xl bg-bg-card border border-white/[0.08] px-5 py-4 flex items-center justify-between hover:border-white/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-[13px] font-semibold text-white/50">
              {(user.display_name || user.username || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[14px] font-medium text-white">{user.display_name || user.username}</p>
              <p className="text-[12px] text-white/35">{user.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-semibold text-white">{purchases} purchases</p>
            <p className="text-[12px] text-white/30">Last: {last?.toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const FULFILLMENT_STATUS = {
  digital_delivered: { label: "Delivered", color: "#4ade80" },
  shipped:           { label: "Shipped",   color: "#00d9ff" },
  pending:           { label: "Pending",   color: "#ffd700" },
  processing:        { label: "Processing",color: "#fb923c" },
  cancelled:         { label: "Cancelled", color: "#fc3c44" },
};

const ORDER_STATUS = {
  completed:          { label: "Completed",         bg: "bg-[#4ade80]/10", text: "text-[#4ade80]",   border: "border-[#4ade80]/20" },
  partially_shipped:  { label: "Partially shipped", bg: "bg-[#00d9ff]/10", text: "text-[#00d9ff]",   border: "border-[#00d9ff]/20" },
  pending:            { label: "Pending",            bg: "bg-[#ffd700]/10", text: "text-[#ffd700]",   border: "border-[#ffd700]/20" },
  cancelled:          { label: "Cancelled",          bg: "bg-accent/10",    text: "text-accent",       border: "border-accent/20" },
};

const MERCH_STATUSES = [
  { value: "pending",   label: "Pending",   color: "#ffd700" },
  { value: "shipped",   label: "Shipped",   color: "#00d9ff" },
  { value: "delivered", label: "Delivered", color: "#4ade80" },
];

function OrdersList({ artistId }) {
  const { getStatus, setStatus } = useFulfillment();

  const artistOrders = orders
    .filter((o) => o.items.some((i) => i.artist_id === artistId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (artistOrders.length === 0) {
    return <div className="py-12 text-white/35 text-[14px]">No orders yet.</div>;
  }

  const getItemStatus = (orderId, productId, fallback) => getStatus(orderId, productId, fallback);
  const setItemStatus = (orderId, productId, value) => setStatus(orderId, productId, value);

  const deriveOrderStatus = (order, myItems) => {
    const statuses = myItems.map((item) =>
      getItemStatus(order._id, item.product_id, item.fulfillment_status)
    );
    const allDone = statuses.every((s) => s === "delivered" || s === "digital_delivered");
    const anyShipped = statuses.some((s) => s === "shipped" || s === "delivered" || s === "digital_delivered");
    const allPending = statuses.every((s) => s === "pending" || s === "processing");
    if (allDone) return "completed";
    if (allPending) return "pending";
    if (anyShipped) return "partially_shipped";
    return "pending";
  };

  return (
    <div className="space-y-3">
      {artistOrders.map((order) => {
        const myItems = order.items.filter((i) => i.artist_id === artistId);
        const gross = myItems.reduce((s, i) => s + i.unit_price * (i.quantity || 1), 0);
        const net = Math.round(gross * (1 - PLATFORM_FEE));
        const buyer = users.find((u) => u._id === order.user_id);
        const buyerName = buyer?.display_name || buyer?.username || order.user_id;
        const derivedStatus = deriveOrderStatus(order, myItems);
        const statusCfg = ORDER_STATUS[derivedStatus] ?? ORDER_STATUS.pending;

        return (
          <div key={order._id} className="rounded-xl border border-white/[0.08] bg-bg-card overflow-hidden">

            {/* Order header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-[12px] font-semibold text-white/50 shrink-0">
                  {buyerName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{buyerName}</p>
                  <p className="text-[11px] text-white/30">
                    {order._id} · {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
                <div className="text-right">
                  <p className="text-[14px] font-bold text-white tabular-nums">฿{net.toLocaleString()}</p>
                  <p className="text-[10px] text-white/25 tabular-nums">฿{gross.toLocaleString()} gross</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-white/[0.04]">
              {myItems.map((item, idx) => {
                const p = products.find((p) => p._id === item.product_id);
                const isMerch = p?.type === "merch";
                const effectiveStatus = getItemStatus(order._id, item.product_id, item.fulfillment_status);
                const fc = FULFILLMENT_STATUS[effectiveStatus] ?? { label: effectiveStatus, color: "#ffffff" };

                return (
                  <div key={idx} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p?.cover_url && (
                        <img src={p.cover_url} alt={item.title_snapshot} className="w-9 h-9 rounded-md object-cover shrink-0 bg-bg" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] text-white/80 font-medium truncate">{item.title_snapshot}</p>
                        <p className="text-[11px] text-white/30 capitalize mt-0.5">
                          {p?.type ?? "—"}{item.variant_id ? " · size M" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {isMerch ? (
                        <select
                          value={effectiveStatus}
                          onChange={(e) => setItemStatus(order._id, item.product_id, e.target.value)}
                          className="rounded-full border px-3 py-1 text-[11px] font-semibold bg-bg outline-none cursor-pointer transition-colors"
                          style={{ color: fc.color, borderColor: `${fc.color}40`, backgroundColor: `${fc.color}12` }}
                        >
                          {MERCH_STATUSES.map((s) => (
                            <option key={s.value} value={s.value} style={{ color: "#fff", backgroundColor: "#1c1c1e" }}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: fc.color, backgroundColor: `${fc.color}15` }}
                        >
                          {fc.label}
                        </span>
                      )}
                      <p className="text-[13px] font-semibold text-white tabular-nums w-16 text-right">
                        ฿{(item.unit_price * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
}

function WithdrawModal({ balance, method, onConfirm, onCancel }) {
  const accountInfo =
    method?.type === "paypal"
      ? method.account_info?.email
      : method?.account_info?.account_number ?? "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-bg-card border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-bold text-white mb-1">Withdraw Funds</h2>
        <p className="text-white/40 text-[13px] mb-5">Funds will be transferred within 3–5 business days.</p>

        <div className="rounded-xl bg-bg border border-white/[0.08] p-4 mb-3">
          <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">Available balance</p>
          <p className="text-[28px] font-bold text-[#4ade80]">฿{balance.toLocaleString()}</p>
        </div>

        <div className="rounded-xl bg-bg border border-white/[0.08] p-4 mb-6">
          <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">Transfer to</p>
          <p className="text-[14px] font-semibold text-white capitalize">{method?.type ?? "—"}</p>
          <p className="text-[13px] text-white/40 mt-0.5">{accountInfo}</p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-white/15 py-2.5 text-[13px] font-semibold text-white/55 hover:bg-white/[0.05] hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={balance === 0}
            className="flex-1 rounded-full bg-[#4ade80] py-2.5 text-[13px] font-semibold text-[#0a1a0a] hover:bg-[#22c55e] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Confirm Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

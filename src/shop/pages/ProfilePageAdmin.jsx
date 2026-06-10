import { useEffect, useRef, useState } from "react";
import { useFulfillment } from "../../contexts/FulfillmentContext";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { apiGet } from "../../lib/api";
import { ORDER_STATUS_LABELS } from "../data/constants";
import {
  artists,
  orders,
  products,
  users,
} from "../data/mockDb";
import { getAllProductsWithArtist } from "../data/helpers";

const PLATFORM_FEE_RATE = 0.10;

export default function ProfilePageAdmin() {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30");
  const [bannerUrl, setBannerUrl] = useState(
    () => localStorage.getItem("adminBannerUrl") || "",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem("adminAvatarUrl") || "",
  );

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "revenue", label: "Revenue" },
    { key: "orders", label: "Orders" },
    { key: "payouts", label: "Payouts" },
    { key: "users", label: "Users" },
    { key: "artists", label: "Artists" },
    { key: "products", label: "Products" },
  ];

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      if (type === "banner") {
        setBannerUrl(url);
        localStorage.setItem("adminBannerUrl", url);
      } else {
        setAvatarUrl(url);
        localStorage.setItem("adminAvatarUrl", url);
      }
    };
    reader.readAsDataURL(file);
  };

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
          <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[12px] px-3 py-1.5 rounded-full border border-white/15">
            Change banner
          </span>
        </div>
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "banner")} />
      </div>

      {/* ── Profile header ── */}
      <div className="px-[5%] -mt-20 relative z-10 md:px-[10%]">
        <div className="flex flex-col gap-4 items-start md:flex-row md:items-end md:gap-6">
          <div
            className="relative w-36 h-36 shrink-0 rounded-full overflow-hidden bg-bg-card ring-4 ring-bg shadow-2xl cursor-pointer group"
            onClick={() => avatarInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/10 text-white text-[2.5rem] font-bold">
                {(user?.display_name || user?.email || "A")[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "avatar")} />
          </div>

          <div className="flex-1 pb-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Admin
            </span>
            <h1 className="text-white text-[2.2rem] font-bold tracking-tight leading-none truncate">
              {user?.display_name || user?.email}
            </h1>
            <p className="text-white/40 text-[13px] mt-1.5">Platform administrator</p>
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
          {activeTab === "overview" && (
            <AdminOverview
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onViewOrders={() => setActiveTab("orders")}
              onViewPayouts={() => setActiveTab("payouts")}
            />
          )}
          {activeTab === "revenue" && <RevenueDashboard />}
          {activeTab === "orders" && <OrdersDashboard />}
          {activeTab === "payouts" && <PayoutsDashboard />}
          {activeTab === "users" && <UserGrid />}
          {activeTab === "artists" && <ArtistGrid />}
          {activeTab === "products" && <ProductGrid />}
        </div>
      </div>
    </div>
  );
}

function AdminOverview({ timeRange, onTimeRangeChange, onViewOrders, onViewPayouts }) {
  const { getStatus } = useFulfillment();

  const nowDate = new Date();
  const cutoff = new Date(nowDate.getTime() - Number(timeRange) * 24 * 60 * 60 * 1000);

  // Filter orders by selected time range
  const filteredOrders = orders.filter((o) => new Date(o.created_at) >= cutoff);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);

  // Artist revenue map (filtered)
  const artistRevMap = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!artistRevMap[item.artist_id]) artistRevMap[item.artist_id] = { sales: 0, revenue: 0 };
      artistRevMap[item.artist_id].sales += item.quantity || 1;
      artistRevMap[item.artist_id].revenue += item.unit_price * (item.quantity || 1);
    });
  });
  const topArtists = artists
    .map((a) => ({
      name: a.name,
      image: a.banner_url,
      sales: artistRevMap[a._id]?.sales ?? 0,
      revenueNum: artistRevMap[a._id]?.revenue ?? 0,
      positive: (artistRevMap[a._id]?.revenue ?? 0) > 0,
    }))
    .filter((a) => a.sales > 0)
    .sort((a, b) => b.revenueNum - a.revenueNum)
    .slice(0, 3);

  // Revenue chart (filtered, bucketed by time range)
  const chartLength = 25;
  const rangeMs = nowDate - cutoff || 1;
  const windowMs = rangeMs / chartLength;
  const revenuePoints = Array.from({ length: chartLength }, (_, i) => {
    const t = i / (chartLength - 1);
    const pointDate = new Date(cutoff.getTime() + t * rangeMs);
    return filteredOrders
      .filter((o) => Math.abs(new Date(o.created_at) - pointDate) < windowMs)
      .reduce((s, o) => s + o.total, 0);
  });
  const maxRev = Math.max(...revenuePoints, 1);
  const chartPoints = revenuePoints
    .map((v, i) => `${(i / (chartLength - 1)) * 100},${100 - Math.round((v / maxRev) * 72 + 8)}`)
    .join(" ");
  const chartArea = `0,100 ${chartPoints} 100,100`;

  // Platform-specific metrics
  const platformFeeEarned = Math.round(totalRevenue * PLATFORM_FEE_RATE);
  const totalPendingPayout = artists.reduce((s, a) => s + (a.payout_balance ?? 0), 0);
  const getDerivedStatus = (order) => {
    const statuses = order.items.map((item) =>
      getStatus(order._id, item.product_id, item.fulfillment_status)
    );
    const allDone = statuses.every((s) => s === "delivered" || s === "digital_delivered");
    const anyShipped = statuses.some((s) => s === "shipped" || s === "delivered" || s === "digital_delivered");
    const allPending = statuses.every((s) => s === "pending" || s === "processing");
    if (allDone) return "completed";
    if (allPending) return "pending";
    if (anyShipped) return "partially_shipped";
    return "pending";
  };

  const completedOrders = filteredOrders.filter((o) => getDerivedStatus(o) === "completed").length;
  const partialOrders = filteredOrders.filter((o) => getDerivedStatus(o) === "partially_shipped").length;
  const fulfillmentRate = filteredOrders.length ? Math.round((completedOrders / filteredOrders.length) * 100) : 0;

  // Payout queue — artists with pending balance
  const payoutQueue = artists
    .filter((a) => (a.payout_balance ?? 0) > 0)
    .sort((a, b) => b.payout_balance - a.payout_balance);

  const latestOrders = getOrderRows(filteredOrders)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  return (
    <section className="text-white space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Platform</p>
          <h2 className="text-[20px] font-bold text-white mt-0.5">Overview</h2>
        </div>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="h-9 rounded-full border border-white/10 bg-bg-card px-4 text-[13px] font-medium text-white/60 outline-none cursor-pointer hover:border-white/20 transition-colors"
        >
          <option value="1">Last 1 day</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* ── Platform metric cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-t-2 border-t-accent border-white/10 bg-bg-card px-4 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Platform GMV</p>
          <p className="text-[24px] font-bold leading-none tracking-tight text-white mt-2.5">฿{totalRevenue.toLocaleString()}</p>
          <p className="mt-1.5 text-[11px] text-white/25">gross merchandise value</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-bg-card px-4 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Fees Earned</p>
          <p className="text-[24px] font-bold leading-none tracking-tight text-[#4ade80] mt-2.5">฿{platformFeeEarned.toLocaleString()}</p>
          <p className="mt-1.5 text-[11px] text-white/25">10% of GMV</p>
        </div>
        <div
          onClick={onViewPayouts}
          className="rounded-xl border border-white/10 bg-bg-card px-4 py-4 cursor-pointer hover:border-white/20 transition-colors"
        >
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Pending Payouts</p>
          <p className="text-[24px] font-bold leading-none tracking-tight text-brand-gold mt-2.5">฿{totalPendingPayout.toLocaleString()}</p>
          <p className="mt-1.5 text-[11px] text-accent">manage payouts →</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-bg-card px-4 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Fulfillment Rate</p>
          <p className="text-[24px] font-bold leading-none tracking-tight text-white mt-2.5">{fulfillmentRate}%</p>
          <p className="mt-1.5 text-[11px] text-white/25">{completedOrders}/{filteredOrders.length} completed</p>
        </div>
      </div>

      {/* ── GMV Chart + Order status ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Platform GMV</p>
              <h3 className="text-[15px] font-semibold text-white mt-0.5">Last {timeRange} {timeRange === "1" ? "day" : "days"} — all artists</h3>
            </div>
            <span className="text-[11px] font-medium text-white/25 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">THB</span>
          </div>
          <div className="relative h-[130px]">
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[9px] text-white/20 pointer-events-none w-8">
              <span>{Math.ceil(Math.max(...revenuePoints, 1))}</span>
              <span>{Math.ceil(Math.max(...revenuePoints, 1) * 0.5)}</span>
              <span>0</span>
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-y-0 left-8 right-0 h-full w-[calc(100%-2rem)]" aria-hidden="true">
              <defs>
                <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fc3c44" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fc3c44" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" />
              ))}
              <polygon points={chartArea} fill="url(#adminRevFill)" />
              <polyline points={chartPoints} fill="none" stroke="#fc3c44" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Fulfillment</p>
          <h3 className="text-[15px] font-semibold text-white mt-0.5 mb-5">Order status</h3>
          {filteredOrders.length === 0 ? (
            <p className="text-[13px] text-white/25 mt-4">No orders in this period.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Completed", count: completedOrders, color: "#4ade80" },
                { label: "Partial / Shipped", count: partialOrders, color: "#00d9ff" },
                { label: "Other", count: filteredOrders.length - completedOrders - partialOrders, color: "#ffd700" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[11px] text-white/45">{s.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white">{s.count}</span>
                  </div>
                  <div className="h-[3px] rounded-full bg-white/6 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((s.count / filteredOrders.length) * 100)}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Artist leaderboard + Payout queue ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Leaderboard</p>
              <h3 className="text-[15px] font-semibold text-white mt-0.5">Top artists</h3>
            </div>
            <Link to="/artist" className="text-[11px] text-white/30 no-underline hover:text-white/65 transition-colors">View all →</Link>
          </div>
          {topArtists.length === 0 ? (
            <p className="text-[13px] text-white/25">No sales in this period.</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {topArtists.map((artist, i) => (
                <div key={artist.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`text-[10px] w-3 shrink-0 font-bold ${i === 0 ? "text-brand-gold" : "text-white/20"}`}>{i + 1}</span>
                  <img src={artist.image} alt="" className={`h-8 w-8 rounded-full object-cover shrink-0 ${i === 0 ? "ring-1 ring-brand-gold/40" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white/80 truncate">{artist.name}</p>
                    <p className="text-[10px] text-white/30">{artist.sales} item{artist.sales !== 1 ? "s" : ""} sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold text-white tabular-nums">฿{artist.revenueNum.toLocaleString()}</p>
                    <p className="text-[10px] text-[#4ade80]">+฿{Math.round(artist.revenueNum * PLATFORM_FEE_RATE).toLocaleString()} fee</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Finance</p>
              <h3 className="text-[15px] font-semibold text-white mt-0.5">Payout queue</h3>
            </div>
            <button type="button" onClick={onViewPayouts} className="text-[11px] text-white/30 hover:text-white/65 transition-colors">Manage →</button>
          </div>
          {payoutQueue.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[13px] text-white/25">All payouts cleared</p>
              <p className="text-[11px] text-[#4ade80] mt-1">No pending balances</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {payoutQueue.map((a) => (
                <div key={a._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <img src={a.banner_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white/80 truncate">{a.name}</p>
                    <p className="text-[10px] text-white/30 capitalize">{a.payout_method?.type ?? "—"} · {a.payout_method?.account_info?.email ?? ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-brand-gold tabular-nums">฿{a.payout_balance.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30">pending</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Latest orders ── */}
      <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Activity</p>
            <h3 className="text-[15px] font-semibold text-white mt-0.5">Latest orders</h3>
          </div>
          <button type="button" onClick={onViewOrders} className="text-[11px] text-white/30 hover:text-white/65 transition-colors">See all →</button>
        </div>
        <div className="space-y-1">
          {latestOrders.length === 0 ? (
            <p className="text-[13px] text-white/25">No orders in this period.</p>
          ) : latestOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="min-w-0 mr-4">
                <p className="text-[12px] font-medium text-white/75 truncate">{order.products}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{order.id} · {order.date}</p>
              </div>
              <p className="text-[13px] font-semibold text-white tabular-nums shrink-0">฿{order.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RevenueDashboard() {

  const grossRevenue = orders.reduce((s, o) => s + o.total, 0);
  const platformFees = Math.round(grossRevenue * PLATFORM_FEE_RATE);
  const artistPayout = grossRevenue - platformFees;

  let digitalOrders = new Set(), digitalRevenue = 0;
  let merchOrders = new Set(), merchRevenue = 0;
  let bundleOrders = new Set(), bundleRevenue = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const p = products.find((p) => p._id === item.product_id);
      const rev = item.unit_price * (item.quantity || 1);
      if (p?.type === "merch") { merchRevenue += rev; merchOrders.add(order._id); }
      else if (p?.type === "single" || p?.type === "album") { digitalRevenue += rev; digitalOrders.add(order._id); }
      else { bundleRevenue += rev; bundleOrders.add(order._id); }
    });
  });

  const rows = [
    ["Digital downloads", `${digitalOrders.size} orders`, `฿${digitalRevenue.toLocaleString()}`, digitalRevenue > 0 ? "✓" : "—"],
    ["Merchandise", `${merchOrders.size} orders`, `฿${merchRevenue.toLocaleString()}`, merchRevenue > 0 ? "✓" : "—"],
    ...(bundleRevenue > 0 ? [["Bundles", `${bundleOrders.size} orders`, `฿${bundleRevenue.toLocaleString()}`, "✓"]] : []),
  ];

  return (
    <section className="text-white space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Finance</p>
          <h2 className="text-[20px] font-bold text-white mt-0.5">Revenue</h2>
        </div>
        <button className="rounded-full border border-white/10 bg-bg-card px-4 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 transition-colors">
          Export report
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AdminPanelCard label="Gross revenue" value={`฿${grossRevenue.toLocaleString()}`} detail="customer paid" />
        <AdminPanelCard label="Platform fees" value={`฿${platformFees.toLocaleString()}`} detail="10% rate" />
        <AdminPanelCard label="Artist payout" value={`฿${artistPayout.toLocaleString()}`} detail="net to artists" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-1">Breakdown</p>
        <h3 className="text-[15px] font-semibold text-white mb-4">By channel</h3>
        <div className="overflow-x-auto">
        <div className="min-w-120 grid grid-cols-[1fr_130px_120px_60px]">
          <div className="contents text-[10px] uppercase tracking-widest text-white/35 font-semibold">
            <span className="pb-3 border-b border-white/6">Channel</span>
            <span className="pb-3 border-b border-white/6">Volume</span>
            <span className="pb-3 border-b border-white/6">Revenue</span>
            <span className="pb-3 border-b border-white/6 text-right">Status</span>
          </div>
          {rows.map(([channel, volume, revenue, trend]) => (
            <>
              <span key={channel + "c"} className="py-3 border-b border-white/5 text-[13px] font-semibold text-white last:border-b-0">{channel}</span>
              <span key={channel + "v"} className="py-3 border-b border-white/5 text-[13px] text-white/70">{volume}</span>
              <span key={channel + "r"} className="py-3 border-b border-white/5 text-[13px] text-white/70">{revenue}</span>
              <span key={channel + "t"} className="py-3 border-b border-white/5 text-[13px] text-right font-semibold text-[#4ade80]">{trend}</span>
            </>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

function getOrderRows(orderList = orders) {
  return orderList.map((order) => {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const productPreview = order.items
      .map((item) => item.title_snapshot)
      .slice(0, 2)
      .join(", ");

    return {
      id: order._id,
      products:
        order.items.length > 2
          ? `${productPreview} +${order.items.length - 2}`
          : productPreview,
      items: itemCount,
      total: order.total,
      status: ORDER_STATUS_LABELS[order.status] || order.status,
      date: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(order.created_at),
      createdAt: new Date(order.created_at),
    };
  });
}

const ITEM_STATUS_STYLE = {
  digital_delivered: { label: "Delivered",  color: "#4ade80" },
  delivered:         { label: "Delivered",  color: "#4ade80" },
  shipped:           { label: "Shipped",    color: "#00d9ff" },
  pending:           { label: "Pending",    color: "#ffd700" },
  processing:        { label: "Processing", color: "#fb923c" },
  cancelled:         { label: "Cancelled",  color: "#fc3c44" },
};

function OrdersDashboard() {
  const { getStatus } = useFulfillment();

  const deriveOrderStatus = (order) => {
    const statuses = order.items.map((item) =>
      getStatus(order._id, item.product_id, item.fulfillment_status)
    );
    const allDone = statuses.every((s) => s === "delivered" || s === "digital_delivered");
    const anyShipped = statuses.some((s) => s === "shipped" || s === "delivered" || s === "digital_delivered");
    const allPending = statuses.every((s) => s === "pending" || s === "processing");
    if (allDone) return "completed";
    if (allPending) return "pending";
    if (anyShipped) return "partially_shipped";
    return "pending";
  };
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const platformFees = Math.round(totalRevenue * 0.10);
  const activeOrders = orders.filter((o) =>
    ["pending", "partially_shipped"].includes(deriveOrderStatus(o)),
  ).length;

  return (
    <section className="text-white space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Order management</p>
          <h2 className="text-[20px] font-bold text-white mt-0.5">Orders</h2>
        </div>
        {activeOrders > 0 && (
          <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-[12px] font-semibold text-brand-gold">
            {activeOrders} active
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AdminPanelCard label="Total orders" value={orders.length} detail="All time" />
        <AdminPanelCard label="Gross sales" value={`฿${totalRevenue.toLocaleString()}`} detail="Customer paid" />
        <AdminPanelCard label="Platform fees" value={`฿${platformFees.toLocaleString()}`} detail="10% fee" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-1">Records</p>
        <h3 className="text-[15px] font-semibold text-white mb-4">All orders</h3>
        <div className="space-y-3">
          {orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((order) => {
              const buyer = users.find((u) => u._id === order.user_id);
              const buyerName = buyer?.display_name || buyer?.username || order.user_id;
              const date = new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              const hasUpdate = order.items.some((item) => getStatus(order._id, item.product_id, null) !== null);
              const derivedStatus = deriveOrderStatus(order);
              const statusColors = {
                completed: { label: "Completed", color: "#4ade80" },
                partially_shipped: { label: "Partially shipped", color: "#00d9ff" },
                pending: { label: "Pending", color: "#ffd700" },
              };
              const orderStatusStyle = statusColors[derivedStatus] ?? statusColors.pending;

              return (
                <div key={order._id} className="rounded-xl border border-white/[0.07] bg-bg overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-[11px] font-semibold text-white/45 shrink-0">
                        {buyerName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{buyerName}</p>
                        <p className="text-[11px] text-white/30">{order._id} · {date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: orderStatusStyle.color, backgroundColor: `${orderStatusStyle.color}15` }}
                      >
                        {orderStatusStyle.label}
                      </span>
                      {hasUpdate && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                          Artist updated
                        </span>
                      )}
                      <p className="text-[14px] font-bold text-white tabular-nums">฿{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                  {/* Items */}
                  <div className="divide-y divide-white/4">
                    {order.items.map((item) => {
                      const effectiveStatus = getStatus(order._id, item.product_id, item.fulfillment_status);
                      const style = ITEM_STATUS_STYLE[effectiveStatus] ?? { label: effectiveStatus, color: "#fff" };
                      const isUpdated = getStatus(order._id, item.product_id, null) !== null;
                      const p = products.find((p) => p._id === item.product_id);
                      return (
                        <div key={item.product_id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {p?.cover_url && <img src={p.cover_url} alt="" className="w-7 h-7 rounded object-cover shrink-0" />}
                            <div className="min-w-0">
                              <p className="text-[12px] text-white/70 truncate">{item.title_snapshot}</p>
                              <p className="text-[10px] text-white/30 capitalize">{p?.type ?? "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isUpdated ? "ring-1" : ""}`}
                              style={{ color: style.color, backgroundColor: `${style.color}15`, ringColor: style.color }}
                            >
                              {style.label}
                            </span>
                            <p className="text-[12px] font-semibold text-white/60 tabular-nums w-14 text-right">
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
      </div>
    </section>
  );
}
function PayoutsDashboard() {

  const [paid, setPaid] = useState([]);

  const payoutQueue = artists
    .map((a) => {
      const artistOrders = orders.filter((o) =>
        o.items.some((i) => i.artist_id === a._id)
      );
      const grossRevenue = artistOrders.reduce((s, o) =>
        s + o.items.filter((i) => i.artist_id === a._id)
          .reduce((si, i) => si + i.unit_price * (i.quantity || 1), 0), 0);
      return {
        ...a,
        grossRevenue,
        feeDeducted: Math.round(grossRevenue * PLATFORM_FEE_RATE),
        netEarned: Math.round(grossRevenue * (1 - PLATFORM_FEE_RATE)),
        orderCount: artistOrders.length,
      };
    })
    .filter((a) => a.orderCount > 0)
    .sort((a, b) => b.payout_balance - a.payout_balance);

  const totalPending = payoutQueue.reduce((s, a) => s + (a.payout_balance ?? 0), 0);
  const totalPaid = paid.reduce((s, id) => {
    const a = payoutQueue.find((x) => x._id === id);
    return s + (a?.payout_balance ?? 0);
  }, 0);

  return (
    <section className="text-white space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Finance</p>
        <h2 className="text-[20px] font-bold text-white mt-0.5">Artist Payouts</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AdminPanelCard label="Total Pending" value={`฿${totalPending.toLocaleString()}`} detail="awaiting disbursement" />
        <AdminPanelCard label="Artists with Balance" value={payoutQueue.filter(a => (a.payout_balance ?? 0) > 0).length} detail={`of ${payoutQueue.length} active`} />
        <AdminPanelCard label="Platform Rate" value="10%" detail="fee per transaction" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
      <div className="min-w-175 bg-bg-card overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[1fr_100px_100px_100px_110px_120px] gap-4 px-5 py-3 border-b border-white/6 text-[10px] uppercase tracking-widest text-white/35 font-semibold">
          <span>Artist</span>
          <span className="text-right">Gross</span>
          <span className="text-right">Fee (10%)</span>
          <span className="text-right">Net</span>
          <span className="text-right">Balance</span>
          <span className="text-right">Action</span>
        </div>

        {payoutQueue.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[14px] text-white/30">No artist payouts to process.</p>
          </div>
        ) : payoutQueue.map((a) => {
          const isPaid = paid.includes(a._id);
          const hasPending = (a.payout_balance ?? 0) > 0;
          return (
            <div key={a._id} className="grid grid-cols-[1fr_100px_100px_100px_110px_120px] gap-4 items-center px-5 py-4 border-b border-white/4 last:border-b-0 hover:bg-white/2 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <img src={a.banner_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white/80 truncate">{a.name}</p>
                  <p className="text-[10px] text-white/30">{a.orderCount} order{a.orderCount !== 1 ? "s" : ""} · {a.payout_method?.type ?? "—"}</p>
                </div>
              </div>
              <p className="text-[13px] text-white/60 tabular-nums text-right">฿{a.grossRevenue.toLocaleString()}</p>
              <p className="text-[13px] text-[#4ade80] tabular-nums text-right">฿{a.feeDeducted.toLocaleString()}</p>
              <p className="text-[13px] text-white tabular-nums text-right font-semibold">฿{a.netEarned.toLocaleString()}</p>
              <p className={`text-[13px] tabular-nums text-right font-bold ${hasPending ? "text-brand-gold" : "text-white/25"}`}>
                ฿{(a.payout_balance ?? 0).toLocaleString()}
              </p>
              <div className="flex justify-end">
                {isPaid ? (
                  <span className="text-[11px] font-semibold text-[#4ade80] flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Paid
                  </span>
                ) : hasPending ? (
                  <button
                    type="button"
                    onClick={() => setPaid((p) => [...p, a._id])}
                    className="rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-3 py-1.5 text-[11px] font-semibold hover:bg-brand-gold/20 transition-colors"
                  >
                    Pay ฿{(a.payout_balance ?? 0).toLocaleString()}
                  </button>
                ) : (
                  <span className="text-[11px] text-white/25">No balance</span>
                )}
              </div>
            </div>
          );
        })}

        {totalPending > 0 && (
          <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between bg-white/2">
            <p className="text-[13px] text-white/50">
              {payoutQueue.filter(a => (a.payout_balance ?? 0) > 0 && !paid.includes(a._id)).length} artists pending · ฿{(totalPending - totalPaid).toLocaleString()} remaining
            </p>
            <button
              type="button"
              onClick={() => setPaid(payoutQueue.filter(a => (a.payout_balance ?? 0) > 0).map(a => a._id))}
              className="rounded-full bg-brand-gold px-5 py-2 text-[13px] font-bold text-[#080817] hover:bg-yellow-300 transition-colors"
            >
              Pay all artists
            </button>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

function AdminPanelCard({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-white/10 bg-bg-card px-4 py-4">
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{label}</p>
      <p className="mt-2.5 text-[24px] font-bold leading-none tracking-tight text-white">{value}</p>
      <p className="mt-1.5 text-[11px] text-white/25">{detail}</p>
    </div>
  );
}

function UserGrid() {
  return (
    <div className="space-y-2">
      {users.map((item) => (
        <div key={item._id} className="rounded-xl bg-bg-card border border-white/10 px-5 py-4 flex items-center justify-between hover:border-white/20 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-[13px] font-semibold text-white/50 shrink-0">
              {(item.display_name || item.username || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-white truncate">{item.display_name || item.username}</p>
              <p className="text-[12px] text-white/35 truncate">{item.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-white/50 capitalize">{item.user_type}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${item.status === "active" ? "bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80]" : "bg-white/5 border border-white/10 text-white/35"}`}>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ArtistGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
      {artists.map((artist) => (
        <Link
          key={artist._id}
          to={`/artist/${artist.slug}`}
          className="flex flex-col gap-2 no-underline group"
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-bg-card">
            <img
              src={artist.banner_url}
              alt={artist.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-white/85 text-[13px] font-medium truncate group-hover:text-white transition-colors">
              {artist.name}
            </p>
            <p className="text-white/40 text-[11px] truncate">
              {artist.location}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductGrid() {
  const [productTab, setProductTab] = useState("tracks");
  const [managedProducts, setManagedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fallbackProducts = getAllProductsWithArtist();
  const productList = managedProducts.length > 0 ? managedProducts : fallbackProducts;

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet("/products/manage");
        if (!cancelled) setManagedProducts(response.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const trackProducts = productList.filter(
    (product) => product.type !== "merch",
  );
  const merchProducts = productList.filter(
    (product) => product.type === "merch",
  );
  const moderationProducts = productList.filter(
    (product) => product.status !== "published" || product.deleted_at,
  );
  const visibleProducts =
    productTab === "tracks"
      ? trackProducts
      : productTab === "merch"
        ? merchProducts
        : moderationProducts;
  const productTabs = [
    { key: "tracks", label: "Tracks", count: trackProducts.length },
    { key: "merch", label: "Merch", count: merchProducts.length },
    {
      key: "moderation",
      label: "Moderation",
      count: moderationProducts.length,
    },
  ];

  return (
    <section className="text-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Catalog admin</p>
          <h2 className="text-[20px] font-bold text-white mt-0.5">Products</h2>
        </div>
        <div className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/6">
          {productTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setProductTab(tab.key)}
              className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${
                productTab === tab.key
                  ? "bg-white/10 text-white border border-white/8"
                  : "text-white/40 hover:text-white/65"
              }`}
            >
              {tab.label} <span className="text-white/30">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#fc3c44]/25 bg-[#fc3c44]/10 px-4 py-3 text-[13px] text-[#ff9a9e]">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-lg bg-white/[0.06]" />
          ))}
        </div>
      )}

      {!loading && productTab === "moderation" && visibleProducts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-bg-card p-8 text-center">
          <p className="text-[16px] font-semibold text-white">Moderation queue is clear</p>
          <p className="mt-2 text-[13px] text-white/40">Drafts, hidden items, and deleted products will appear here.</p>
        </div>
      ) : !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
          {visibleProducts.map((product) => (
            <div
              key={product._id}
              className="flex flex-col gap-2 group"
            >
              <Link to={`/product/${product.slug || product._id}`} className="aspect-square w-full overflow-hidden rounded-lg bg-bg-card no-underline">
                <img
                  src={product.cover_url}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/55">
                    {product.type}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-brand-cyan">
                    {product.status}
                  </span>
                </div>
                <Link to={`/product/${product.slug || product._id}`} className="block text-white/85 text-[13px] font-medium truncate no-underline group-hover:text-white transition-colors">
                  {product.title}
                </Link>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-white/40 text-[11px] truncate">
                    {product.artist?.name || product.artist?.display_name || "Unknown"}
                  </p>
                  <Link to={`/products/${product._id}/edit`} className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-white/60 no-underline hover:border-white/30 hover:text-white">
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

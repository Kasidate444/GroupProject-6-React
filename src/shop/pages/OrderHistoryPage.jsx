import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Box, CheckCircle2, Clock, Package, ReceiptText, Truck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiGet } from "../../lib/api";

const statusConfig = {
  pending: { label: "Pending", className: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200", icon: Clock },
  processing: { label: "Processing", className: "border-blue-400/25 bg-blue-400/10 text-blue-200", icon: Package },
  shipped: { label: "Shipped", className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200", icon: Truck },
  completed: { label: "Completed", className: "border-green-400/25 bg-green-400/10 text-green-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "border-red-400/25 bg-red-400/10 text-red-200", icon: Clock },
};

const paymentConfig = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
};

const formatCurrency = (amount) => (
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(Number(amount) || 0)
);

const formatDate = (date) => {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderId = (order) => order._id || order.id;
const getOrderDate = (order) => order.createdAt || order.created_at || order.purchaseDate;
const getOrderStatus = (order) => order.order_status || order.status || "pending";
const getPaymentStatus = (order) => order.payment_status || order.paymentStatus || "pending";

const getOrderItems = (order) => Array.isArray(order.items) ? order.items : [];
const hasMerch = (order) => getOrderItems(order).some((item) => (item.product_type || item.type) === "merch");
const hasDigital = (order) => getOrderItems(order).some((item) => ["single", "album", "digital"].includes(item.product_type || item.type));

export default function OrderHistoryPage() {
  const { isLoggedIn, authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet("/orders");
        if (!cancelled) setOrders(response.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!authLoading && isLoggedIn) loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn]);

  const totals = useMemo(() => {
    const paid = orders.filter((order) => getPaymentStatus(order) === "paid");
    return {
      all: orders.length,
      paid: paid.length,
      merch: orders.filter(hasMerch).length,
      totalSpent: paid.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    };
  }, [orders]);

  if (authLoading) return <OrdersSkeleton />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <main className="min-h-screen bg-bg px-[5%] py-10 font-['Plus_Jakarta_Sans',sans-serif] text-white md:px-[10%]">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-7 text-sm text-white/30">
          <Link to="/profile" className="hover:text-white/65">Profile</Link>
          <span className="mx-2">/</span>
          <span className="text-white/55">Orders</span>
        </nav>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Purchase history</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Orders</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
              Track downloads, merch fulfillment, payment status, and order details.
            </p>
          </div>
          <Link to="/shop" className="w-fit rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-accent-hover">
            Continue shopping
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total orders" value={totals.all} />
          <Stat label="Paid orders" value={totals.paid} />
          <Stat label="Merch orders" value={totals.merch} />
          <Stat label="Total spent" value={formatCurrency(totals.totalSpent)} />
        </div>

        {loading ? (
          <OrdersSkeleton compact />
        ) : error ? (
          <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow key={getOrderId(order)} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">{label}</p>
      <p className="mt-2 truncate text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function OrderRow({ order }) {
  const orderId = getOrderId(order);
  const status = getOrderStatus(order);
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  const itemCount = getOrderItems(order).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return (
    <Link
      to={`/orders/${orderId}`}
      className="group grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 no-underline transition-colors hover:border-white/20 hover:bg-white/[0.07] md:grid-cols-[1.1fr_1fr_auto]"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ReceiptText className="h-4 w-4 text-white/35" />
          <p className="truncate text-sm font-semibold text-white">Order #{String(orderId).slice(-8).toUpperCase()}</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        </div>
        <p className="mt-2 text-xs text-white/35">{formatDate(getOrderDate(order))}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
        {hasDigital(order) && <span className="rounded-md bg-blue-400/10 px-2.5 py-1 text-blue-200/75">Digital</span>}
        {hasMerch(order) && <span className="rounded-md bg-cyan-400/10 px-2.5 py-1 text-cyan-200/75">Merch</span>}
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">{paymentConfig[getPaymentStatus(order)] || getPaymentStatus(order)}</span>
      </div>

      <div className="flex items-center justify-between gap-4 md:justify-end">
        <p className="text-base font-bold text-white">{formatCurrency(order.total)}</p>
        <ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
      </div>
    </Link>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
      <Box className="mx-auto h-8 w-8 text-white/25" />
      <h2 className="mt-4 text-lg font-semibold text-white">No orders yet</h2>
      <p className="mt-2 text-sm text-white/40">Your purchased music and merch orders will appear here.</p>
      <Link to="/shop" className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-accent-hover">
        Browse shop
      </Link>
    </div>
  );
}

function OrdersSkeleton({ compact = false }) {
  return (
    <main className={compact ? "" : "min-h-screen bg-bg px-[5%] py-10 md:px-[10%]"}>
      <div className="mx-auto max-w-6xl space-y-3">
        {!compact && (
          <>
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="h-10 w-56 animate-pulse rounded bg-white/10" />
          </>
        )}
        {Array.from({ length: compact ? 4 : 6 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        ))}
      </div>
    </main>
  );
}

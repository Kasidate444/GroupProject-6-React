import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Download, Package, Truck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiGet } from "../../lib/api";

const statusSteps = ["pending", "processing", "shipped", "completed"];
const statusLabels = {
  pending: "Order placed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusConfig = {
  pending: { label: "Pending", className: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200", icon: Clock },
  processing: { label: "Processing", className: "border-blue-400/25 bg-blue-400/10 text-blue-200", icon: Package },
  shipped: { label: "Shipped", className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200", icon: Truck },
  completed: { label: "Completed", className: "border-green-400/25 bg-green-400/10 text-green-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "border-red-400/25 bg-red-400/10 text-red-200", icon: Clock },
};

const formatCurrency = (amount) => (
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(Number(amount) || 0)
);

const formatDateTime = (date) => {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderId = (order) => order?._id || order?.id || "";
const getOrderDate = (order) => order?.createdAt || order?.created_at || order?.purchaseDate;
const getOrderStatus = (order) => order?.order_status || order?.status || "pending";
const getPaymentStatus = (order) => order?.payment_status || order?.paymentStatus || "pending";
const getOrderItems = (order) => Array.isArray(order?.items) ? order.items : [];
const getProductType = (item) => item.product_type || item.type || item.product_id?.type || "product";
const isMerchItem = (item) => getProductType(item) === "merch";
const isDigitalItem = (item) => ["single", "album", "digital"].includes(getProductType(item));

const getItemTitle = (item) => item.title_snapshot || item.name || item.product_id?.title || "Untitled item";
const getItemArtist = (item) => item.artist_name_snapshot || item.artist || item.product_id?.artist?.display_name || item.product_id?.artist?.username || "Unknown artist";
const getItemCover = (item) => item.cover_url_snapshot || item.image || item.product_id?.cover_url || item.product_id?.coverUrl?.url || "";

const getShippingAddress = (order) => order?.shipping_address || order?.shippingAddress || order?.shipping || null;

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { isLoggedIn, authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet(`/orders/${orderId}`);
        if (!cancelled) setOrder(response.data || response);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!authLoading && isLoggedIn) loadOrder();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, orderId]);

  const items = getOrderItems(order);
  const merchItems = useMemo(() => items.filter(isMerchItem), [items]);
  const digitalItems = useMemo(() => items.filter(isDigitalItem), [items]);
  const status = getOrderStatus(order);
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const shippingAddress = getShippingAddress(order);

  if (authLoading) return <OrderDetailSkeleton />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (loading) return <OrderDetailSkeleton />;

  if (error || !order) {
    return (
      <main className="min-h-screen bg-bg px-[5%] py-10 font-['Plus_Jakarta_Sans',sans-serif] text-white md:px-[10%]">
        <div className="mx-auto max-w-4xl rounded-lg border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-200">
          {error || "Order not found."}
          <Link to="/orders" className="mt-4 block text-white/70 hover:text-white">Back to orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg px-[5%] py-10 font-['Plus_Jakarta_Sans',sans-serif] text-white md:px-[10%]">
      <div className="mx-auto max-w-6xl">
        <Link to="/orders" className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 no-underline transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Order details</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Order #{String(getOrderId(order)).slice(-8).toUpperCase()}</h1>
            <p className="mt-2 text-sm text-white/40">{formatDateTime(getOrderDate(order))}</p>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.className}`}>
            <StatusIcon className="h-4 w-4" />
            {config.label}
          </span>
        </div>

        {merchItems.length > 0 && <FulfillmentTimeline status={status} />}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="space-y-5 lg:col-span-2">
            <Panel title="Items">
              <div className="space-y-3">
                {items.map((item, index) => (
                  <OrderItem key={`${item.product_id?._id || item.product_id || index}-${index}`} item={item} />
                ))}
              </div>
            </Panel>

            {digitalItems.length > 0 && (
              <Panel title="Digital downloads">
                <div className="space-y-3">
                  {digitalItems.map((item, index) => (
                    <div key={`${item.product_id?._id || item.product_id || index}-download`} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-semibold text-white">{getItemTitle(item)}</p>
                      <p className="mt-1 text-xs text-white/35">{(item.download_tracks || []).length} file{(item.download_tracks || []).length === 1 ? "" : "s"} available</p>
                      <Link to="/profile" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent no-underline hover:text-accent-hover">
                        <Download className="h-4 w-4" />
                        View in collection
                      </Link>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {merchItems.length > 0 && (
              <Panel title="Shipping">
                {shippingAddress ? <ShippingAddress address={shippingAddress} /> : <p className="text-sm text-white/40">No shipping address attached to this order.</p>}
              </Panel>
            )}
          </section>

          <aside className="space-y-5">
            <Panel title="Summary">
              <div className="space-y-3 text-sm">
                <SummaryRow label="Payment" value={getPaymentStatus(order)} />
                <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal)} />
                <SummaryRow label="Shipping" value={formatCurrency(order.shipping_fee)} />
                <SummaryRow label="Discount" value={`-${formatCurrency(order.discount_amount)}`} />
                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Panel>

            <Panel title="Fulfillment">
              {merchItems.length > 0 ? (
                <div className="space-y-2 text-sm text-white/55">
                  <p>{merchItems.length} merch item{merchItems.length === 1 ? "" : "s"} in this order.</p>
                  <p>Status: <span className="font-semibold text-white">{statusLabels[status] || status}</span></p>
                </div>
              ) : (
                <p className="text-sm text-white/45">Digital-only order. No shipping required.</p>
              )}
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}

function FulfillmentTimeline({ status }) {
  const activeIndex = status === "cancelled" ? -1 : Math.max(statusSteps.indexOf(status), 0);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {statusSteps.map((step, index) => {
          const active = index <= activeIndex;
          return (
            <div key={step} className={`rounded-lg border p-3 ${active ? "border-accent/40 bg-accent/10" : "border-white/10 bg-white/[0.03]"}`}>
              <p className={`text-sm font-semibold ${active ? "text-white" : "text-white/35"}`}>{statusLabels[step]}</p>
              <p className="mt-1 text-xs text-white/30">{active ? "Reached" : "Waiting"}</p>
            </div>
          );
        })}
      </div>
      {status === "cancelled" && <p className="mt-3 text-sm text-red-300">This order has been cancelled.</p>}
    </section>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/35">{title}</h2>
      {children}
    </section>
  );
}

function OrderItem({ item }) {
  const type = getProductType(item);
  return (
    <div className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
        {getItemCover(item) ? <img src={getItemCover(item)} alt={getItemTitle(item)} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{getItemTitle(item)}</p>
            <p className="mt-1 truncate text-sm text-white/40">{getItemArtist(item)}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-white/[0.06] px-2 py-1 capitalize text-white/45">{type}</span>
              {item.variant_id && <span className="rounded-md bg-white/[0.06] px-2 py-1 text-white/45">Variant {item.variant_id}</span>}
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-white/45">Qty {item.quantity || 1}</span>
            </div>
          </div>
          <p className="shrink-0 text-sm font-bold text-white">{formatCurrency(item.subtotal ?? (Number(item.unit_price) || 0) * (Number(item.quantity) || 1))}</p>
        </div>
      </div>
    </div>
  );
}

function ShippingAddress({ address }) {
  return (
    <div className="space-y-1 text-sm text-white/55">
      <p className="font-semibold text-white">{address.full_name || address.fullName || "Recipient"}</p>
      <p>{address.address_line1 || address.address}</p>
      {address.address_line2 && <p>{address.address_line2}</p>}
      <p>{[address.city, address.state, address.postal_code || address.postalCode].filter(Boolean).join(" ")}</p>
      {address.country && <p>{address.country}</p>}
      {address.phone && <p>{address.phone}</p>}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/45">{label}</span>
      <span className="font-semibold capitalize text-white">{value}</span>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <main className="min-h-screen bg-bg px-[5%] py-10 md:px-[10%]">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.04] lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </main>
  );
}

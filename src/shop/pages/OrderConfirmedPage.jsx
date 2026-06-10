import { useEffect, useState } from "react";
import Footer from "../../components/common/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, FileText } from "lucide-react";
import { getProductTracks } from "../utils/productShape";

const sanitizeFilename = (value) => (
  String(value || "download")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120)
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const triggerAnchorDownload = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const triggerDownload = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to fetch audio file");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerAnchorDownload(objectUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    triggerAnchorDownload(url, filename);
  }
};

const getProductId = (item) => item.productId || item.product_id || item.product?._id || item.product;

const normalizeTrackDownloads = (tracks = [], fallbackTitle = "Track") => (
  tracks
    .map((track, index) => {
      const url = track.audio_file_url || track.audio_url?.url || track.audioUrl?.url || null;
      if (!url) return null;
      return {
        title: track.title || `${fallbackTitle} ${index + 1}`,
        url,
      };
    })
    .filter(Boolean)
);

export default function OrderConfirmedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;
  const [downloadStatus, setDownloadStatus] = useState({});

  useEffect(() => {
    if (!orderData) {
      navigate("/shop", { replace: true });
    }
  }, [navigate, orderData]);

  if (!orderData) return null;

  const {
    orderId,
    purchaseDate,
    purchaseTime,
    paymentMethod,
    items = [],
    shippingAddress,
    subtotal = 0,
    discountAmount = 0,
    shipping = 0,
    tax = 0,
    total = 0,
    confirmationEmail,
  } = orderData;

  const hasDigitalItems = items.some((item) => item.type === "digital");
  const hasPhysicalItems = items.some((item) => item.type === "merchandise");

  const setItemDownloadStatus = (itemId, nextStatus) => {
    setDownloadStatus((prev) => ({ ...prev, [itemId]: nextStatus }));
  };

  const resolveDownloadTracks = async (item) => {
    const embeddedTracks = normalizeTrackDownloads(item.downloadTracks || item.download_tracks || item.tracks, item.name);
    if (embeddedTracks.length > 0) return embeddedTracks;

    return normalizeTrackDownloads(getProductTracks(item.product), item.name);
  };

  const handleDownloadItem = async (item) => {
    const itemKey = item.id || getProductId(item) || item.name;
    setItemDownloadStatus(itemKey, { state: "loading", message: "Preparing download..." });

    try {
      const tracks = await resolveDownloadTracks(item);
      if (tracks.length === 0) {
        setItemDownloadStatus(itemKey, { state: "error", message: "No downloadable audio found for this item." });
        return;
      }

      for (const [index, track] of tracks.entries()) {
        const filename = `${sanitizeFilename(item.name)} - ${sanitizeFilename(track.title)}.mp3`;
        await triggerDownload(track.url, filename);
        if (index < tracks.length - 1) await wait(350);
      }

      setItemDownloadStatus(itemKey, { state: "success", message: `${tracks.length} download${tracks.length > 1 ? "s" : ""} started.` });
    } catch (err) {
      setItemDownloadStatus(itemKey, { state: "error", message: err.message || "Unable to start download." });
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#0c1428] font-['Plus_Jakarta_Sans',sans-serif]">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <nav className="mb-8 text-sm text-white/30" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="hover:text-white/60 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" className="hover:text-white/60 transition-colors">Shop</Link></li>
            <li>/</li>
            <li className="text-white/50">Order confirmation</li>
          </ol>
        </nav>

        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-white">Order confirmed</h1>
            <p className="text-white/45">Thank you for your purchase</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Payment successful</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-white/8 bg-[#162040] p-6">
              <h2 className="mb-5 text-[13px] font-semibold uppercase tracking-widest text-white/40">Order Details</h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <Detail label="Order no." value={orderId} />
                <Detail label="Purchase date" value={formatDate(purchaseDate)} />
                <Detail label="Purchase time" value={purchaseTime} />
                <Detail label="Payment method" value={paymentMethod} />
              </div>
            </section>

            <section className="rounded-2xl border border-white/8 bg-[#162040] p-6">
              <h2 className="mb-5 text-[13px] font-semibold uppercase tracking-widest text-white/40">Items Purchased</h2>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5 p-4 rounded-xl bg-white/3 border border-white/6">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5 justify-center">
                      <h3 className="font-semibold text-white text-base">{item.name}</h3>
                      <p className="text-sm text-white/45">{item.artist || "Unknown artist"}</p>
                      <p className="text-xs text-white/30">Qty: {item.quantity}</p>
                      <span className={`mt-1 self-start rounded-full px-3 py-1 text-xs font-medium ${
                        item.type === "digital" ? "bg-blue-500/15 text-blue-300" : "bg-white/8 text-white/50"
                      }`}>
                        {item.type === "digital" ? "Digital download" : "Physical item"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {hasPhysicalItems && shippingAddress && (
              <section className="rounded-2xl border border-white/8 bg-[#162040] p-6">
                <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-white/40">Shipping Address</h2>
                <div className="space-y-1 text-sm text-white/70">
                  <p className="font-semibold text-white">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city} {shippingAddress.postalCode}</p>
                </div>
              </section>
            )}

            {hasDigitalItems && (
              <section className="rounded-2xl border border-white/8 bg-[#162040] p-6">
                <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-white/40">Download Your Music</h2>
                <p className="text-sm text-white/40 leading-relaxed">Download links are also sent to your email.</p>
                <div className="mt-8 pt-6 border-t border-white/8 space-y-6">
                  {items.filter((item) => item.type === "digital").map((item) => (
                    <div key={item.id} className="flex flex-col gap-4">
                      <p className="text-base font-semibold text-white mt-2">{item.name}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadItem(item)}
                          disabled={downloadStatus[item.id]?.state === "loading"}
                          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-all disabled:cursor-wait disabled:opacity-60"
                        >
                          <Download className="h-4 w-4" />Download all (MP3)
                        </button>
                        <button
                          type="button"
                          disabled
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/25 cursor-not-allowed"
                          title="FLAC files are not available for this order yet"
                        >
                          <Download className="h-4 w-4" />FLAC unavailable
                        </button>
                      </div>
                      {downloadStatus[item.id]?.message && (
                        <p className={`text-xs ${
                          downloadStatus[item.id].state === "error" ? "text-[#fc3c44]" : "text-white/35"
                        }`}>
                          {downloadStatus[item.id].message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside>
            <div className="space-y-5 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-white/8 bg-[#162040] p-6">
                <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-white/40">Order Summary</h2>
                <div className="space-y-4 text-sm">
                  <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                  {discountAmount > 0 && (
                    <SummaryRow label="Discount" value={`-${formatCurrency(discountAmount)}`} valueClassName="text-green-400" />
                  )}
                  {shipping > 0 && <SummaryRow label="Shipping" value={formatCurrency(shipping)} />}
                  {tax > 0 && <SummaryRow label="Tax (VAT 7%)" value={formatCurrency(tax)} />}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/8 bg-[#162040] p-5">
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">Confirmation sent to</h2>
                <p className="text-sm font-semibold text-white">{confirmationEmail}</p>
                <p className="mt-3 text-xs text-white/35 leading-relaxed">Check spam if not received within 5 mins</p>
              </section>

              <div className="space-y-3">
                <Link to="/shop" className="block w-full rounded-xl bg-accent px-4 py-3 text-center font-semibold text-white hover:bg-accent-hover transition-all shadow-[0_4px_16px_rgba(252,60,68,0.25)]">
                  Continue shopping
                </Link>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white/60 hover:bg-white/10 transition-all">
                  <FileText className="h-4 w-4" />
                  Download receipt (PDF)
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer simple />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] text-white/35 uppercase tracking-widest">{label}</p>
      <p className="font-semibold text-white text-sm leading-loose">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, valueClassName = "text-white" }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-white/45 leading-relaxed">{label}</span>
      <span className={`${valueClassName} leading-relaxed`}>{value}</span>
    </div>
  );
}

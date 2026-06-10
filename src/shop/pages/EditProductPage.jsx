import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { apiDelete, apiGet, apiUpload } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

const MERCH_TYPES = [
  { value: "tshirt", label: "T-shirt" },
  { value: "vinyl", label: "Vinyl" },
  { value: "cd", label: "CD" },
  { value: "cassette", label: "Cassette" },
  { value: "poster", label: "Poster" },
  { value: "snapback", label: "Snapback" },
  { value: "tote", label: "Tote" },
  { value: "other", label: "Other" },
];

const createVariant = () => ({
  id: `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  variantId: "",
  size: "",
  color: "",
  stock: "0",
  sku: "",
});

const getProductVariants = (product) => {
  const variants = product?.detail?.variants || [];
  return variants.map((variant, index) => ({
    id: variant.variant_id || variant.sku || `variant-${index + 1}`,
    variantId: variant.variant_id || variant.sku || `variant-${index + 1}`,
    size: variant.size || "",
    color: variant.color || "",
    stock: String(variant.stock_quantity ?? 0),
    sku: variant.sku || "",
  }));
};

const buildVariantPayload = (variants) => variants.map((variant, index) => ({
  variantId: variant.variantId.trim() || variant.sku.trim() || `variant-${index + 1}`,
  size: variant.size.trim(),
  color: variant.color.trim(),
  stock: Number(variant.stock),
  sku: variant.sku.trim(),
}));

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, authLoading } = useAuth();
  const coverInputRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    status: "published",
    nameYourPrice: false,
    cover: null,
    coverPreview: "",
    merchType: "tshirt",
    weightGrams: "",
    shipsInternationally: false,
    variants: [createVariant()],
  });

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiGet(`/products/manage/${productId}`);
        if (cancelled) return;

        const item = response.data;
        setProduct(item);
        setForm({
          title: item.title || "",
          description: item.description || "",
          price: item.price === undefined ? "" : String(item.price),
          status: item.status || "published",
          nameYourPrice: Boolean(item.name_your_price),
          cover: null,
          coverPreview: item.cover_url || "",
          merchType: item.merch_type || item.merchType || "tshirt",
          weightGrams: item.detail?.weight_grams === null || item.detail?.weight_grams === undefined ? "" : String(item.detail.weight_grams),
          shipsInternationally: Boolean(item.detail?.ships_internationally),
          variants: item.type === "merch" ? getProductVariants(item) : [createVariant()],
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (isLoggedIn && (user?.role === "artist" || user?.role === "admin")) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, productId, user?.role]);

  const totalStock = useMemo(() => (
    form.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
  ), [form.variants]);

  if (!authLoading && !isLoggedIn) return <Navigate to="/login" replace />;
  if (!authLoading && !["artist", "admin"].includes(user?.role)) return <Navigate to="/profile" replace />;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
    setError("");
  };

  const updateVariant = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) => (
        variant.id === id ? { ...variant, [field]: value } : variant
      )),
    }));
    setMessage("");
    setError("");
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, createVariant()] }));
  };

  const removeVariant = (id) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.length <= 1 ? prev.variants : prev.variants.filter((variant) => variant.id !== id),
    }));
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    updateField("cover", file);
    updateField("coverPreview", URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.description.trim()) return "Description is required.";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return "Price must be a valid number.";
    if (product?.type === "merch") {
      for (const variant of form.variants) {
        const stock = Number(variant.stock);
        if (!Number.isInteger(stock) || stock < 0) return "Variant stock must be a non-negative integer.";
      }
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !product) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("status", form.status);
      fd.append("nameYourPrice", String(form.nameYourPrice));
      if (form.cover) fd.append("cover", form.cover);

      if (product.type === "merch") {
        fd.append("merchType", form.merchType);
        fd.append("stock", String(totalStock));
        fd.append("variants", JSON.stringify(buildVariantPayload(form.variants)));
        fd.append("weightGrams", form.weightGrams === "" ? "" : String(Number(form.weightGrams)));
        fd.append("shipsInternationally", String(form.shipsInternationally));
      }

      const response = await apiUpload(`/products/${product._id}`, fd, "PATCH");
      setProduct(response.data);
      setMessage("Product updated.");
    } catch (err) {
      setError(err.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || !product) return;
    const confirmed = window.confirm("Delete this product? It will be hidden from the shop.");
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await apiDelete(`/products/${product._id}`);
      navigate(user?.role === "admin" ? "/admin" : "/artist", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to delete product.");
      setDeleting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-bg px-[5%] py-10 text-white md:px-[10%]">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-96 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="min-h-screen bg-bg px-[5%] py-10 text-white md:px-[10%]">
        <p className="text-sm text-[#fc3c44]">{error}</p>
        <Link to={user?.role === "admin" ? "/admin" : "/artist"} className="mt-4 inline-flex text-sm text-white/70 hover:text-white">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg px-[5%] py-8 font-['Plus_Jakarta_Sans',sans-serif] text-white md:px-[10%]">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Catalog manager</p>
          <h1 className="mt-1 text-[28px] font-bold leading-tight text-white">Edit product</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/product/${product.slug || product._id}`} className="rounded-lg border border-white/15 px-4 py-2 text-[13px] font-medium text-white/70 no-underline hover:border-white/30 hover:text-white">
            View
          </Link>
          <Link to={user?.role === "admin" ? "/admin" : "/artist"} className="rounded-lg border border-white/15 px-4 py-2 text-[13px] font-medium text-white/70 no-underline hover:border-white/30 hover:text-white">
            Back
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <section className="space-y-3">
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleCoverChange} className="hidden" />
          <button type="button" onClick={() => coverInputRef.current?.click()} className="aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] text-left">
            {form.coverPreview ? (
              <img src={form.coverPreview} alt={form.title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-[13px] text-white/40">Upload cover</span>
            )}
          </button>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase text-white/40">Type</p>
            <p className="mt-1 text-[14px] font-semibold capitalize">{product.type}</p>
          </div>
        </section>

        <section className="space-y-5 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Title</span>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-white/30" />
            </label>
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Status</span>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-white/30">
                <option value="published" className="bg-[#141414]">Published</option>
                <option value="draft" className="bg-[#141414]">Draft</option>
                <option value="archived" className="bg-[#141414]">Archived</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Description</span>
            <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-white/30" />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Price</span>
              <input type="number" min={0} value={form.price} onChange={(e) => updateField("price", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-white/30" />
            </label>
            {product.type !== "merch" && (
              <label className="flex items-end gap-2 pb-2.5 text-[13px] text-white/80">
                <input type="checkbox" checked={form.nameYourPrice} onChange={(e) => updateField("nameYourPrice", e.target.checked)} className="h-4 w-4 accent-[#fc3c44]" />
                Name your price
              </label>
            )}
          </div>

          {product.type === "merch" && (
            <MerchFields
              form={form}
              totalStock={totalStock}
              onFieldChange={updateField}
              onVariantChange={updateVariant}
              onAddVariant={addVariant}
              onRemoveVariant={removeVariant}
            />
          )}

          {(error || message) && (
            <p className={`text-[13px] ${error ? "text-[#fc3c44]" : "text-emerald-300"}`}>
              {error || message}
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
            <button type="button" onClick={handleDelete} disabled={deleting || saving} className="rounded-lg border border-[#fc3c44]/40 px-4 py-2.5 text-[13px] font-semibold text-[#ff767b] hover:bg-[#fc3c44]/10 disabled:opacity-50">
              {deleting ? "Deleting..." : "Delete product"}
            </button>
            <button type="submit" disabled={saving || deleting} className="rounded-lg bg-[#fc3c44] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#e8333b] disabled:opacity-50">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}

function MerchFields({ form, totalStock, onFieldChange, onVariantChange, onAddVariant, onRemoveVariant }) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Merch type</span>
          <select value={form.merchType} onChange={(e) => onFieldChange("merchType", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-white/30">
            {MERCH_TYPES.map((type) => <option key={type.value} value={type.value} className="bg-[#141414]">{type.label}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Weight grams</span>
          <input type="number" min={0} value={form.weightGrams} onChange={(e) => onFieldChange("weightGrams", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-white/30" />
        </label>
        <label className="flex items-end gap-2 pb-2.5 text-[13px] text-white/80">
          <input type="checkbox" checked={form.shipsInternationally} onChange={(e) => onFieldChange("shipsInternationally", e.target.checked)} className="h-4 w-4 accent-[#fc3c44]" />
          Ships internationally
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.1em] text-white/45">Variants</span>
          <span className="text-[12px] text-white/45">Total stock: {totalStock}</span>
        </div>
        <div className="space-y-2">
          {form.variants.map((variant) => (
            <div key={variant.id} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3 md:grid-cols-[1fr_1fr_1fr_90px_auto]">
              <input value={variant.variantId} onChange={(e) => onVariantChange(variant.id, "variantId", e.target.value)} placeholder="Variant ID" className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-white/30" />
              <input value={variant.size} onChange={(e) => onVariantChange(variant.id, "size", e.target.value)} placeholder="Size" className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-white/30" />
              <input value={variant.color} onChange={(e) => onVariantChange(variant.id, "color", e.target.value)} placeholder="Color" className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-white/30" />
              <input type="number" min={0} value={variant.stock} onChange={(e) => onVariantChange(variant.id, "stock", e.target.value)} placeholder="Stock" className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white outline-none focus:border-white/30" />
              <button type="button" onClick={() => onRemoveVariant(variant.id)} className="rounded-md border border-white/10 px-3 py-2 text-[12px] text-white/55 hover:border-[#fc3c44]/40 hover:text-[#ff767b]">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={onAddVariant} className="mt-3 rounded-lg border border-white/15 px-4 py-2 text-[13px] font-medium text-white/70 hover:border-white/30 hover:text-white">
          Add variant
        </button>
      </div>
    </div>
  );
}

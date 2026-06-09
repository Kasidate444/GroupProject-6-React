import { useState, useRef } from "react";
import { validateMerchForm, MERCH_TYPES } from "../utils/uploadValidationMerch";
import { validateCoverFile } from "../utils/uploadValidation";
import { apiUpload } from "../lib/api";

export default function UploadMerchForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    cover: null,
    coverPreview: null,
    title: "",
    type: "tshirt",
    description: "",
    price: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const coverInputRef = useRef(null);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateCoverFile(file);
    if (err) {
      setErrors((prev) => ({ ...prev, cover: err }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, cover: file, coverPreview: previewUrl }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cover;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const { isValid, errors: formErrors } = validateMerchForm(form);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("cover", form.cover);
      fd.append("title", form.title.trim());
      fd.append("merchType", form.type);
      fd.append("description", form.description.trim());
      fd.append("price", form.price);

      const result = await apiUpload("/products/merch", fd);

      if (onSuccess) onSuccess(result.data);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Upload failed",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-[140px_1fr] gap-5">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">Image *</label>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleCoverChange} className="hidden" />
          <div
            onClick={() => coverInputRef.current?.click()}
            className={`aspect-square rounded-lg cursor-pointer transition-all overflow-hidden ${
              form.coverPreview ? "border border-white/15" : "bg-white/[0.03] border-[1.5px] border-dashed border-white/15 hover:border-white/30 flex flex-col items-center justify-center"
            } ${errors.cover ? "!border-[#fc3c44]" : ""}`}
          >
            {form.coverPreview ? (
              <img src={form.coverPreview} alt="Product preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span className="text-[10px] text-white/40">Upload</span>
              </>
            )}
          </div>
          {errors.cover && <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.cover}</p>}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Logo T-shirt"
              maxLength={100}
              className={`w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border outline-none text-white text-[14px] transition-colors ${errors.title ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}`}
            />
            {errors.title && <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-1.5">Type *</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-white/[0.05] border outline-none text-white text-[13px] transition-colors ${errors.type ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}`}
            >
              {MERCH_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="bg-[#141414]">{type.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-[11px] text-[#fc3c44] mt-1">{errors.type}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Product description..."
          rows={3}
          maxLength={500}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border outline-none text-white text-[13px] resize-y transition-colors ${errors.description ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}`}
        />
        {errors.description && <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">Price (THB) *</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          placeholder="750"
          min={0}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border outline-none text-white text-[14px] transition-colors ${errors.price ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}`}
        />
        {errors.price && <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.price}</p>}
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        {errors.submit && <p className="mr-auto text-[11px] text-[#fc3c44]">{errors.submit}</p>}
        <button type="button" onClick={onCancel} disabled={submitting} className="px-4 py-2 text-[13px] font-medium text-white/65 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-5 py-2 text-[13px] font-semibold text-white bg-[#fc3c44] hover:bg-[#e8333b] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "Uploading..." : "Upload Merch"}
        </button>
      </div>
    </form>
  );
}

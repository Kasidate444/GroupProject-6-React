import { useState, useRef } from "react";
import {
  validateSingleForm,
  validateCoverFile,
  validateAudioFile,
  formatBytes,
} from "../utils/uploadValidation";
import { apiUpload } from "../lib/api";

// =============================================================================
// UPLOAD SINGLE FORM — เนื้อหาฟอร์ม Upload Single (ใส่ใน UploadModal)
// =============================================================================
// State:
//   cover           — File object (รูป)
//   coverPreview    — URL preview รูป
//   audio           — File object (เสียง)
//   title           — string
//   description     — string
//   price           — string (input ใช้ string ดีกว่า)
//   nameYourPrice   — boolean
//
// Submit:
//   ตอนนี้ console.log payload (รอ backend)
//   พอ API พร้อม → เปลี่ยน console.log → await fetch('/api/products', ...)
// =============================================================================

export default function UploadSingleForm({ onCancel, onSuccess }) {
  // ── form state ──
  const [form, setForm] = useState({
    cover: null,
    coverPreview: null,
    audio: null,
    title: "",
    description: "",
    price: "",
    nameYourPrice: false,
  });

  // ── error state (field name → error message) ──
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── file input refs (ให้กดที่ container แล้ว trigger input file) ──
  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // ── helpers ──
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // ลบ error ของ field นี้เมื่อ user แก้
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
    // สร้าง preview URL
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, cover: file, coverPreview: previewUrl }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cover;
      return next;
    });
  };

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateAudioFile(file);
    if (err) {
      setErrors((prev) => ({ ...prev, audio: err }));
      return;
    }
    updateField("audio", file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // validate ทั้งฟอร์ม
    const { isValid, errors: formErrors } = validateSingleForm(form);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("cover", form.cover);
      fd.append("audio", form.audio);
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("nameYourPrice", String(form.nameYourPrice));

      const result = await apiUpload("/products/single", fd);

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

  // ── ป้องกัน memory leak: revoke object URL ตอน component unmount ──
  // (ปลอดภัยกว่าทำใน useEffect ถ้าโปรเจคใช้ React 18)

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="upload-single-form">

      {/* ── COVER IMAGE ── */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
          Cover Image *
        </label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleCoverChange}
          className="hidden"
        />
        <div
          onClick={() => coverInputRef.current?.click()}
          className={`aspect-square max-w-[140px] rounded-lg cursor-pointer transition-all overflow-hidden
            ${form.coverPreview
              ? "border border-white/15"
              : "bg-white/[0.03] border-[1.5px] border-dashed border-white/15 hover:border-white/30 flex flex-col items-center justify-center"
            }
            ${errors.cover ? "!border-[#fc3c44]" : ""}
          `}
        >
          {form.coverPreview ? (
            <img src={form.coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-[11px] text-white/40">Click to upload</span>
            </>
          )}
        </div>
        <p className="text-[10px] text-white/30 mt-1.5">
          JPG, PNG · Max 5 MB · 1000×1000 recommended
        </p>
        {errors.cover && (
          <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.cover}</p>
        )}
      </div>

      {/* ── AUDIO FILE ── */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
          Audio File *
        </label>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/flac,audio/x-flac"
          onChange={handleAudioChange}
          className="hidden"
        />
        <div
          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-white/[0.03] border transition-colors
            ${errors.audio ? "border-[#fc3c44]" : "border-white/10"}
          `}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className={`text-[13px] flex-1 truncate ${form.audio ? "text-white" : "text-white/40"}`}>
            {form.audio ? `${form.audio.name} · ${formatBytes(form.audio.size)}` : "Choose audio file..."}
          </span>
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="text-[11px] px-3 py-1.5 rounded-md bg-white/[0.08] text-white hover:bg-white/[0.12] transition-colors"
          >
            Browse
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-1.5">
          MP3, WAV, FLAC · Max 50 MB
        </p>
        {errors.audio && (
          <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.audio}</p>
        )}
      </div>

      {/* ── TITLE ── */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g. Hollow Bones"
          maxLength={100}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border outline-none text-white text-[14px] transition-colors
            ${errors.title ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}
          `}
        />
        {errors.title && (
          <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.title}</p>
        )}
      </div>

      {/* ── DESCRIPTION ── */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
          Description *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Tell us about this track..."
          rows={3}
          maxLength={500}
          className={`w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border outline-none text-white text-[14px] resize-y transition-colors
            ${errors.description ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}
          `}
        />
        <div className="flex justify-between mt-1.5">
          {errors.description ? (
            <p className="text-[11px] text-[#fc3c44]">{errors.description}</p>
          ) : <span />}
          <p className="text-[10px] text-white/30 tabular-nums">
            {form.description.length}/500
          </p>
        </div>
      </div>

      {/* ── PRICE + NAME-YOUR-PRICE ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">
            {form.nameYourPrice ? "Minimum Price (THB) *" : "Price (THB) *"}
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="30"
            min={0}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border outline-none text-white text-[14px] transition-colors
              ${errors.price ? "border-[#fc3c44]" : "border-white/10 focus:border-white/30"}
            `}
          />
          {errors.price && (
            <p className="text-[11px] text-[#fc3c44] mt-1.5">{errors.price}</p>
          )}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 py-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.nameYourPrice}
              onChange={(e) => updateField("nameYourPrice", e.target.checked)}
              className="w-4 h-4 accent-[#fc3c44]"
            />
            <span className="text-[13px] text-white/85">Name Your Price</span>
          </label>
        </div>
      </div>

      {/* ── FOOTER BUTTONS (จะถูก lift ขึ้นไป UploadModal.footer) ──
           ผมใส่ปุ่มไว้ที่นี่เพื่อให้ form ทำงานครบ — แต่ pattern ที่ดีกว่า:
           ใน parent ให้ส่ง footer={<UploadActions />} แล้วใน Action เรียก
           form.requestSubmit() — แต่เพื่อความเรียบง่ายตอน demo ใส่ที่นี่ก่อน
      */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        {errors.submit && (
          <p className="mr-auto text-[11px] text-[#fc3c44]">{errors.submit}</p>
        )}
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4.5 py-2 text-[13px] font-medium text-white/65 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5.5 py-2 text-[13px] font-semibold text-white bg-[#fc3c44] hover:bg-[#e8333b] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Uploading..." : "Upload Single"}
        </button>
      </div>
    </form>
  );
}

export default function VariantsBuilder({ variants, onChange, error }) {
  const maxStockQuantity = 9999;
  const handleAdd = () => onChange([...variants, { size: "", color: "", stock: "", sku: "" }]);

  const handleFieldChange = (idx, field, value) => {
    const next = [...variants];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const handleRemove = (idx) => onChange(variants.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-[11px] uppercase tracking-[0.1em] text-white/50">
          Variants ({variants.length})
          <span className="ml-1.5 normal-case text-white/30 text-[10px] tracking-normal">optional</span>
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[11px] px-3 py-1.5 rounded-md bg-[#6c63ff]/15 text-[#9d6dff] border border-[#6c63ff]/30 hover:bg-[#6c63ff]/25 transition-colors inline-flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="p-5 text-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02]">
          <p className="text-[13px] text-white/40 mb-1">No variants</p>
          <p className="text-[11px] text-white/30">Add variants if your product has multiple options (e.g. Size, Color)</p>
        </div>
      ) : (
        <div className={`rounded-lg overflow-hidden border ${error ? "border-[#fc3c44]" : "border-white/[0.08]"} bg-white/[0.02]`}>
          <div className="grid grid-cols-[80px_80px_80px_1fr_30px] gap-2.5 px-3 py-2 border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-white/40">
            <div>Size</div><div>Color</div><div>Stock *</div><div>SKU</div><div />
          </div>
          {variants.map((variant, idx) => (
            <div key={idx} className={`grid grid-cols-[80px_80px_80px_1fr_30px] gap-2.5 px-3 py-2 items-center ${idx !== variants.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
              <input type="text" value={variant.size} onChange={(e) => handleFieldChange(idx, "size", e.target.value)} placeholder="M" maxLength={20} className="px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] focus:border-white/25 rounded-md text-white text-[12px] outline-none transition-colors" />
              <input type="text" value={variant.color} onChange={(e) => handleFieldChange(idx, "color", e.target.value)} placeholder="black" maxLength={30} className="px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] focus:border-white/25 rounded-md text-white text-[12px] outline-none transition-colors" />
              <input type="number" value={variant.stock} onChange={(e) => handleFieldChange(idx, "stock", e.target.value)} placeholder="30" min={0} max={maxStockQuantity} className="px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] focus:border-white/25 rounded-md text-white text-[12px] outline-none transition-colors" />
              <input type="text" value={variant.sku} onChange={(e) => handleFieldChange(idx, "sku", e.target.value)} placeholder="SKU-M-BLK" maxLength={50} className="px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] focus:border-white/25 rounded-md text-white text-[11px] font-mono outline-none transition-colors" />
              <button type="button" onClick={() => handleRemove(idx)} aria-label="Remove variant" className="w-7 h-7 flex items-center justify-center rounded text-[rgba(255,80,110,0.6)] hover:text-[rgba(255,80,110,1)] hover:bg-[rgba(255,80,110,0.08)] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-[#fc3c44] mt-1.5">{error}</p>}
      {!error && variants.length > 0 && <p className="text-[10px] text-white/30 mt-1.5">SKU should be unique · Stock is required</p>}
    </div>
  );
}

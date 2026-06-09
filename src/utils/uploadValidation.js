// =============================================================================
// UPLOAD VALIDATION — ตรวจสอบข้อมูล Upload Single
// =============================================================================
// แยก logic validate ออกมาจาก UI เพื่อให้:
//   - แก้ง่าย (ไม่ปนกับ JSX)
//   - test ได้ (อนาคต)
//   - ใช้ซ้ำได้ใน Album/Merch (logic บางอันใช้ร่วมกัน)
// =============================================================================

// ---- Constants ----
export const FILE_LIMITS = {
  COVER_MAX_BYTES: 5 * 1024 * 1024,   // 5 MB
  AUDIO_MAX_BYTES: 50 * 1024 * 1024,  // 50 MB
  COVER_TYPES: ["image/jpeg", "image/png", "image/jpg"],
  AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/flac", "audio/x-flac"],
};

export const TEXT_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 100,
  DESC_MAX: 500,
  PRICE_MIN: 0,
  PRICE_MAX: 99999,
};

// ---- Helpers ----

// แปลงไบต์เป็นรูปแบบอ่านง่าย เช่น "2.3 MB"
export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ---- Field validators (return null = OK, return string = error message) ----

export const validateCoverFile = (file) => {
  if (!file) return "Cover image is required";
  if (!FILE_LIMITS.COVER_TYPES.includes(file.type)) {
    return "Cover must be JPG or PNG";
  }
  if (file.size > FILE_LIMITS.COVER_MAX_BYTES) {
    return `Cover too large (${formatBytes(file.size)}). Max 5 MB`;
  }
  return null;
};

export const validateAudioFile = (file) => {
  if (!file) return "Audio file is required";
  if (!FILE_LIMITS.AUDIO_TYPES.includes(file.type)) {
    return "Audio must be MP3, WAV, or FLAC";
  }
  if (file.size > FILE_LIMITS.AUDIO_MAX_BYTES) {
    return `Audio too large (${formatBytes(file.size)}). Max 50 MB`;
  }
  return null;
};

export const validateTitle = (title) => {
  const t = (title || "").trim();
  if (t.length < TEXT_LIMITS.TITLE_MIN) return "Title is required";
  if (t.length > TEXT_LIMITS.TITLE_MAX) {
    return `Title too long (max ${TEXT_LIMITS.TITLE_MAX} chars)`;
  }
  return null;
};

export const validateDescription = (desc) => {
  const d = (desc || "").trim();
  if (d.length === 0) return "Description is required";
  if (d.length > TEXT_LIMITS.DESC_MAX) {
    return `Description too long (max ${TEXT_LIMITS.DESC_MAX} chars)`;
  }
  return null;
};

export const validatePrice = (price, isNameYourPrice) => {
  const n = Number(price);
  if (price === "" || price == null) return "Price is required";
  if (!Number.isFinite(n)) return "Price must be a number";
  if (n < TEXT_LIMITS.PRICE_MIN) return "Price cannot be negative";
  if (n > TEXT_LIMITS.PRICE_MAX) return `Price too high (max ${TEXT_LIMITS.PRICE_MAX})`;
  // Name-your-price → ราคาที่กรอกคือ minimum
  if (isNameYourPrice && n === 0) {
    return "Set a minimum price (use 0 only if free)";
  }
  return null;
};

// ---- Whole-form validator ----

export const validateSingleForm = (form) => {
  const errors = {
    cover: validateCoverFile(form.cover),
    audio: validateAudioFile(form.audio),
    title: validateTitle(form.title),
    description: validateDescription(form.description),
    price: validatePrice(form.price, form.nameYourPrice),
  };
  // filter เฉพาะที่มี error จริง
  const cleaned = Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v !== null)
  );
  return {
    isValid: Object.keys(cleaned).length === 0,
    errors: cleaned,
  };
};

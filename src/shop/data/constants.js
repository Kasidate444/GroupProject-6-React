// =============================================================================
// CONSTANTS — UI categories, icons, labels
// =============================================================================
// 💡 Smart Mapping (Decision 2 — แบบ D):
//    UI categories ไม่ตรง schema 1:1 — แต่ helper.filterProductsByCategory
//    จะ map ให้ถูกต้อง
// =============================================================================

// Category สำหรับ filter UI (สอดคล้อง Bandcamp)
// ⭐ เพิ่ม poster / snapback / tote — เพื่อให้ merch ทุกชิ้นมีป้ายตรงประเภทจริง
//    (เดิมมีแค่ 6 แบบ → merch บางตัวตกเป็น "Merch" เพราะ category ไม่ครอบ)
export const CATEGORIES = [
  { key: "all", label: "All categories", icon: "◈" },
  { key: "digital", label: "Digital", icon: "♪" },
  { key: "vinyl", label: "Vinyl", icon: "◎" },
  { key: "cd", label: "Compact disc", icon: "⊙" },
  { key: "cassette", label: "Cassette", icon: "⊟" },
  { key: "tshirt", label: "T-shirt", icon: "✦" },
  { key: "poster", label: "Poster", icon: "▭" },
  { key: "snapback", label: "Snapback", icon: "⊓" },
  { key: "tote", label: "Tote bag", icon: "⊞" },
  { key: "other", label: "Other", icon: "◈" },
];

// Type icons สำหรับ product card badges
export const TYPE_ICONS = {
  single: "♪",
  album: "◐",
  merch: "✦",
};

// Merch type icons
// ⭐ เพิ่ม snapback / tote ให้ครบ (poster มีอยู่แล้ว)
export const MERCH_TYPE_ICONS = {
  tshirt: "✦",
  vinyl: "◎",
  cd: "⊙",
  cassette: "⊟",
  poster: "▭",
  snapback: "⊓",
  tote: "⊞",
  other: "◈",
};

// Status colors
export const STATUS_COLORS = {
  draft: "rgba(255,255,255,0.3)",
  published: "rgba(80,200,120,0.8)",
  private: "rgba(255,200,0,0.7)",
  unavailable: "rgba(255,120,80,0.7)",
  deleted: "rgba(255,60,80,0.6)",
};

// Order status labels
export const ORDER_STATUS_LABELS = {
  pending_payment: "Pending payment",
  paid: "Paid",
  partially_shipped: "Partially shipped",
  fully_shipped: "Fully shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// Fulfillment status labels
export const FULFILLMENT_STATUS_LABELS = {
  digital_delivered: "Delivered (digital)",
  pending: "Pending",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Platform fee percentage
export const PLATFORM_FEE_PERCENT = 15; // 15% (ตาม mentor feedback)

// Fixed shipping rate (ตาม mentor feedback)
export const FIXED_SHIPPING_THB = 100;

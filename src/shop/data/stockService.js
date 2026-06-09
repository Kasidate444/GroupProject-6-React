import { merch } from "./mockDb/merch.js";

const STORAGE_KEY = "audtlist_stock";

function loadOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function getVariantStock(variantId) {
  const overrides = loadOverrides();
  if (variantId in overrides) return overrides[variantId];
  for (const item of merch) {
    const v = item.variants.find((v) => v.variant_id === variantId);
    if (v) return v.stock_quantity;
  }
  return 0;
}

export function getMerchWithLiveStock(productId) {
  const merchItem = merch.find((m) => m.product_id === productId);
  if (!merchItem) return null;
  const overrides = loadOverrides();
  return {
    ...merchItem,
    variants: merchItem.variants.map((v) => ({
      ...v,
      stock_quantity:
        v.variant_id in overrides ? overrides[v.variant_id] : v.stock_quantity,
    })),
  };
}

export function deductStock(cartItems) {
  const overrides = loadOverrides();
  for (const item of cartItems) {
    if (item.type !== "merchandise") continue;
    const qty = item.quantity || 1;
    if (item.variantId) {
      const current = getVariantStock(item.variantId);
      overrides[item.variantId] = Math.max(0, current - qty);
    } else {
      // ไม่มี variantId — หักจาก variant แรกที่ยังมีสต๊อก
      const merchItem = merch.find((m) => m.product_id === item.productId);
      if (merchItem) {
        const target = merchItem.variants.find((v) => {
          const stock = v.variant_id in overrides ? overrides[v.variant_id] : v.stock_quantity;
          return stock > 0;
        });
        if (target) {
          const current = target.variant_id in overrides
            ? overrides[target.variant_id]
            : target.stock_quantity;
          overrides[target.variant_id] = Math.max(0, current - qty);
        }
      }
    }
  }
  saveOverrides(overrides);
}

export function resetStock() {
  localStorage.removeItem(STORAGE_KEY);
}

import {
  validateCoverFile,
  validateTitle,
  validateDescription,
  validatePrice,
} from "./uploadValidation";

export const MERCH_TYPES = [
  { value: "tshirt", label: "T-shirt" },
  { value: "vinyl", label: "Vinyl" },
  { value: "cd", label: "CD" },
  { value: "cassette", label: "Cassette" },
  { value: "poster", label: "Poster" },
  { value: "snapback", label: "Snapback" },
  { value: "tote", label: "Tote bag" },
];

export const validateMerchType = (type) => {
  if (!type) return "Type is required";
  const allowed = MERCH_TYPES.map((t) => t.value);
  if (!allowed.includes(type)) return "Invalid type";
  return null;
};

const validateNonNegativeInteger = (value, label, required = false) => {
  if (value === "" || value === null || value === undefined) {
    return required ? `${label} is required` : null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return `${label} must be a non-negative integer`;
  return null;
};

const validateNonNegativeNumber = (value, label) => {
  if (value === "" || value === null || value === undefined) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return `${label} must be a valid number`;
  return null;
};

export const validateMerchVariants = (variants = []) => {
  const seenSkus = new Set();

  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index];
    const stockError = validateNonNegativeInteger(variant.stock, `Variant ${index + 1} stock`, true);
    if (stockError) return stockError;

    const sku = variant.sku?.trim();
    if (sku) {
      if (seenSkus.has(sku.toLowerCase())) return "Variant SKUs must be unique";
      seenSkus.add(sku.toLowerCase());
    }
  }

  return null;
};

export const validateMerchForm = (form) => {
  const hasVariants = form.variants?.length > 0;

  const errors = {
    cover: validateCoverFile(form.cover),
    title: validateTitle(form.title),
    type: validateMerchType(form.type),
    description: validateDescription(form.description),
    price: validatePrice(form.price, false),
    stock: hasVariants ? null : validateNonNegativeInteger(form.stock, "Stock", true),
    weightGrams: validateNonNegativeNumber(form.weightGrams, "Weight"),
    variants: validateMerchVariants(form.variants),
  };

  const cleaned = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null),
  );

  return { isValid: Object.keys(cleaned).length === 0, errors: cleaned };
};

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
  { value: "other", label: "Other" },
];

export const validateMerchType = (type) => {
  if (!type) return "Type is required";
  const allowed = MERCH_TYPES.map((t) => t.value);
  if (!allowed.includes(type)) return "Invalid type";
  return null;
};

const validateNonNegativeInteger = (value, label) => {
  if (value === "" || value === null || value === undefined) return `${label} is required`;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return `${label} must be a non-negative whole number`;
  return null;
};

const validateOptionalNonNegativeNumber = (value, label) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return `${label} must be a non-negative number`;
  return null;
};

export const validateMerchForm = (form) => {
  const errors = {
    cover: validateCoverFile(form.cover),
    title: validateTitle(form.title),
    type: validateMerchType(form.type),
    description: validateDescription(form.description),
    price: validatePrice(form.price, false),
    weightGrams: validateOptionalNonNegativeNumber(form.weightGrams, "Weight"),
  };

  if (!Array.isArray(form.variants) || form.variants.length === 0) {
    errors.variants = "Add at least one variant";
  } else {
    const variantErrors = form.variants.map((variant, index) => {
      const row = {};
      const stockError = validateNonNegativeInteger(variant.stock, `Variant ${index + 1} stock`);
      if (stockError) row.stock = stockError;
      return row;
    });

    if (variantErrors.some((row) => Object.keys(row).length > 0)) {
      errors.variantRows = variantErrors;
      errors.variants = "Fix variant stock values";
    }
  }

  const cleaned = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null && value !== undefined),
  );

  return { isValid: Object.keys(cleaned).length === 0, errors: cleaned };
};

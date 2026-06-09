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

export const validateMerchForm = (form) => {
  const errors = {
    cover: validateCoverFile(form.cover),
    title: validateTitle(form.title),
    type: validateMerchType(form.type),
    description: validateDescription(form.description),
    price: validatePrice(form.price, false),
  };

  const cleaned = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== null),
  );

  return { isValid: Object.keys(cleaned).length === 0, errors: cleaned };
};

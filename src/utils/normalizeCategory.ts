const CAMEL_CASE_BOUNDARY = /([a-z0-9])([A-Z])/g;
const NON_ALPHANUMERIC_SEQUENCE = /[^a-zA-Z0-9]+/g;

const normalizeToken = (input: string, tokenName: string): string => {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error(`${tokenName} must be a non-empty string`);
  }

  return trimmed
    .replace(CAMEL_CASE_BOUNDARY, "$1_$2")
    .replace(NON_ALPHANUMERIC_SEQUENCE, "_")
    .replace(/__+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
};

export const normalizeCategory = (category: string): string => normalizeToken(category, "category");

export const normalizeKeywordValue = (value: string): string =>
  normalizeToken(value, "keyword value");

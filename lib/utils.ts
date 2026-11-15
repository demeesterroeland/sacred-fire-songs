import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge that knows the design-token utilities (Story 6.1.1 / G1.1).
 * Without this, `text-meta` (a font size) and `text-fg` (a colour) look like
 * the same group and one silently drops the other.
 */
export const TOKEN_FONT_SIZES = ["caption", "meta", "body", "row", "title", "display"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TOKEN_FONT_SIZES] }],
      rounded: [{ rounded: ["control", "panel", "sheet", "pill"] }],
      shadow: [{ shadow: ["sheet"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Collapses multiple consecutive whitespace characters into a single space
 * and trims leading/trailing whitespace.
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Removes diacritics (accents) from a string.
 */
export function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

/**
 * Format a date value as DD-MM-YYYY.
 * Returns "—" if the date is missing or invalid.
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

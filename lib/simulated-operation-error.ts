
"use client";

export function getSimulatedOperationError(): string {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `Request failed. Please try again. (ERR-${code})`;
}

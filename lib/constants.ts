export const PAYMENT_METHODS = [
  "Cash",
  "bKash",
  "Nagad",
  "Rocket",
  "Cheque",
  "Bank Transfer",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

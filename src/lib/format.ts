export function formatPrice(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

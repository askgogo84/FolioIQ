export function money(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "Unavailable"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(value);
}

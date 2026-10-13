export function safeNext(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\x00-\x1f]/.test(value) &&
    !value.startsWith("/auth")
    ? value
    : "/dashboard";
}

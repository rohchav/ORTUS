export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function formatTick(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function truncateId(value: string, length = 12): string {
  return value.length <= length ? value : `${value.slice(0, length - 1)}…`;
}

export function jsonPreview(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

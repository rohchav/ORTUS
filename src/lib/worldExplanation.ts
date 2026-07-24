const unrelatedProductBoundary =
  /\bdoes not make (?:Builder|model-schema|visual builder)\b|^(?:Builder|model-schema|visual builder|NetLogo|Mesa|MASON)\b/i;

export function isModelSpecificWorldGuidance(value: string): boolean {
  return value.trim().length > 0 && !unrelatedProductBoundary.test(value.trim());
}

export function uniqueWorldGuidance(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const normalized = normalizeWorldGuidance(value);
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

export function normalizeWorldGuidance(value: string): string {
  return value.trim().toLowerCase().replace(/[\s.!?,;:]+/g, " ").trim();
}

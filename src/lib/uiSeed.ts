export function generateUiSeed(): string {
  const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (webCrypto?.randomUUID) {
    return `ortus-${webCrypto.randomUUID().slice(0, 13)}`;
  }
  if (webCrypto) {
    const values = new Uint32Array(2);
    webCrypto.getRandomValues(values);
    return `ortus-${values[0]?.toString(16) ?? "seed"}-${values[1]?.toString(16) ?? "field"}`;
  }
  return `ortus-${Date.now().toString(36)}`;
}

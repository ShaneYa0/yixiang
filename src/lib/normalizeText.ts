export function normalizeText(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (!/[\u0080-\u00ff]/.test(text)) return text;

  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const decodedChineseCount = (decoded.match(/[\u4e00-\u9fff]/g) ?? []).length;
    const originalChineseCount = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
    return decodedChineseCount > originalChineseCount ? decoded : text;
  } catch {
    return text;
  }
}

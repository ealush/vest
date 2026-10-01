export default function isStringValue(v: unknown): v is string {
  return typeof v === 'string';
}

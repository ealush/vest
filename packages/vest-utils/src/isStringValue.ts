export default function isStringValue(v: unknown): v is string {
  return String(v) === v;
}

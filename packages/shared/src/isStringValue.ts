export default function (v: unknown): v is string {
  return String(v) === v;
}

export default function isBoolean(value: unknown): value is boolean {
  return !!value === value;
}

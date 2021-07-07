export default function either(a: unknown, b: unknown): boolean {
  return !!a !== !!b;
}

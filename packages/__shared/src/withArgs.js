// Transpilation makes `...` quite large in terms of bundle size.
// This is a small wrapper that replaces rest parameter with an array
export default function withAgs(cb) {
  return (...args) => cb(args);
}

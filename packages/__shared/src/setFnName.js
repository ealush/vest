export default function setFnName(fn, value) {
  return Object.defineProperty(fn, 'name', { value });
}

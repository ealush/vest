export default function anyOf(value, ...rules) {
  return Boolean(!rules) || rules.some(fn => fn(value));
}

export default function asArray<T>(possibleArg: T | T[]): T[] {
  return ([] as T[]).concat(possibleArg);
}

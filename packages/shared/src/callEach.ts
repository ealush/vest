export default function callEach(arr: ((...args: any[]) => any)[]): void {
  return arr.forEach(fn => fn());
}

export default function callEach(arr: Function[]): void {
  return arr.forEach(fn => fn());
}

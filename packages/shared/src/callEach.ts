export default function callEach(arr: Function[]) {
  return arr.forEach(fn => fn());
}

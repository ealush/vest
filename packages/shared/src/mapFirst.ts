export default function mapFirst<T>(
  array: T[],
  callback: (
    item: T,
    breakout: (value: unknown) => void,
    index: number
  ) => unknown
): any {
  let broke = false;
  let breakoutValue = null;
  for (let i = 0; i < array.length; i++) {
    callback(array[i], breakout, i);

    if (broke) {
      return breakoutValue;
    }
  }

  function breakout(value: unknown) {
    broke = true;
    breakoutValue = value;
  }
}

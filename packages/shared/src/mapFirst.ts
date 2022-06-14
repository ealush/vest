export default function mapFirst<T>(
  array: T[],
  callback: (
    item: T,
    breakout: (conditional: boolean, value: unknown) => void,
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

  function breakout(conditional: boolean, value: unknown) {
    if (conditional) {
      broke = true;
      breakoutValue = value;
    }
  }
}

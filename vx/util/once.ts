export default function once<T extends (...args: any[]) => unknown>(
  callback: T,
): (...args: Parameters<T>) => void {
  let ran = false;

  return (...args: Parameters<T>) => {
    if (!ran) {
      try {
        callback(...args);
      } catch {
        // ignore
      }

      ran = true;
    }
  };
}

import { CB } from 'utilityTypes';

export default function bailGuard<T extends CB>(
  guard: (...args: Parameters<T>) => boolean,
  cb: T
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    const res = guard(...args);
    if (res) {
      return cb(...args);
    }
  };
}

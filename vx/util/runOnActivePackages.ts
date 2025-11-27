import { packageNames } from 'vx/packageNames.js';
import { usePackage, withPackage } from 'vx/vxContext.js';

export default function runOnActivePackages<T extends (...args: any[]) => any>(
  callback: T,
  ...args: Parameters<T>
): ReturnType<T> | void {
  const name = usePackage();

  if (name) {
    return callback(...args);
  }

  packageNames.list.forEach(packageName =>
    withPackage(packageName, () => callback(...args)),
  );
}

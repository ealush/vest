import { createContext } from 'context';

export type PackageContext = {
  packageName?: string;
};

export const ctx = createContext<PackageContext>({});

export function withPackage<T>(
  packageName: string | undefined,
  callback: () => T,
): T {
  if (!packageName) {
    return callback();
  }
  process.env.VX_PACKAGE_NAME = packageName;
  return ctx.run({ packageName }, () => callback());
}

export function usePackage(): string | undefined {
  return ctx.use().packageName ?? process.env.VX_PACKAGE_NAME;
}

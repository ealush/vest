import fs from 'fs';

import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

export type PackageJson = Record<string, unknown> & {
  vxAllowResolve?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  version?: string;
  name?: string;
};

export default function packageJson(pkgName = usePackage()): PackageJson {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(vxPath.packageJson(pkgName), 'utf8');
  return JSON.parse(jsonString) as PackageJson;
}

export function getVxAllowResolve(pkgName = usePackage()): string[] {
  return packageJson(pkgName).vxAllowResolve ?? [];
}

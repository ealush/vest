import fs, { promises as fsPromises } from 'fs';
import path from 'path';

import { defineConfig, type UserConfig } from 'tsdown';

import opts from 'vx/opts';
import vxPath from 'vx/vxPath';

type PackageConfigOptions = {
  packageDir: string;
  devExports?: boolean | string;
};

const processedOutDirs = new Set<string>();

export function createPackageConfig({
  packageDir,
  devExports = false,
}: PackageConfigOptions): UserConfig {
  const packageName = readPackageName(packageDir);
  const mainEntry = vxPath.packageSrc(packageName, `${packageName}.ts`);

  return defineConfig({
    alias: {
      [`@${packageName}`]: `./${opts.dir.SRC}`,
      '@exports': `./${opts.dir.SRC}/${opts.dir.EXPORTS}`,
    },
    clean: [opts.dir.DIST, opts.dir.TYPES],
    cwd: packageDir,
    dts: {
      sourcemap: true,
      resolver: 'oxc',
    },
    entry: [mainEntry, vxPath.packageSrcExports(packageName, '*.ts')],
    exports: {
      all: true,
      devExports,
      customExports(exportsMap) {
        return addExportsAliases(addRootExports(exportsMap, packageName));
      },
    },
    format: ['esm', 'cjs'],
    hash: true,
    hooks: {
      'build:done': async function ({ options }) {
        const distDir = options.outDir;
        const typesDir = vxPath.package(packageName, opts.dir.TYPES);

        if (processedOutDirs.has(distDir)) {
          return;
        }
        processedOutDirs.add(distDir);

        const movedDts = await relocateDtsFiles(distDir, typesDir);
        const typeMap = buildTypesMap(movedDts, packageName);
        const mainTypesPath = selectMainTypesFile(typeMap, packageName);
        const legacyDtsPath = await ensureLegacyDtsFile(
          packageDir,
          mainTypesPath,
          packageName,
        );

        await updatePackageJsonTypes(
          packageDir,
          packageName,
          typeMap,
          mainTypesPath,
          legacyDtsPath,
        );
      },
    },
    name: packageName,
    outDir: opts.dir.DIST,
    platform: 'node',
    shims: true,
    sourcemap: true,
    tsconfig: vxPath.packageTsConfig(packageName),
  });
}

function addRootExports(
  exportsMap: Record<string, any>,
  packageName: string,
): Record<string, any> {
  const rootExport = exportsMap[`./${packageName}`] ?? exportsMap['./index'];

  if (rootExport && !exportsMap['.']) {
    exportsMap['.'] = rootExport;
  }

  const packageJson = `./${opts.fileNames.PACKAGE_JSON}`;

  exportsMap[packageJson] ??= packageJson;

  return exportsMap;
}

function addExportsAliases(
  exportsMap: Record<string, any>,
): Record<string, any> {
  const aliasPrefix = './exports/';

  Object.keys(exportsMap).forEach(key => {
    if (!key.startsWith(aliasPrefix)) {
      return;
    }

    const shortKey = `./${key.slice(aliasPrefix.length)}`;

    if (!exportsMap[shortKey]) {
      exportsMap[shortKey] = exportsMap[key];
    }
  });

  return exportsMap;
}

function readPackageName(packageDir: string): string {
  const pkgJsonPath = vxPath.packageJson(path.basename(packageDir));
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  return pkgJson.name;
}

async function relocateDtsFiles(
  distDir: string,
  typesDir: string,
  relativePrefix = '',
): Promise<string[]> {
  const entries = await fsPromises.readdir(distDir, { withFileTypes: true });
  const moved: string[] = [];

  for (const entry of entries) {
    const sourcePath = path.join(distDir, entry.name);
    const relativePath = path.posix.join(
      relativePrefix,
      entry.name.split(path.sep).join(path.posix.sep),
    );

    if (entry.isDirectory()) {
      const nested = await relocateDtsFiles(
        sourcePath,
        path.join(typesDir, entry.name),
        relativePath,
      );
      moved.push(...nested);
      continue;
    }

    if (!entry.name.includes('.d.')) {
      continue;
    }

    const targetPath = path.join(typesDir, entry.name);

    await fsPromises.mkdir(path.dirname(targetPath), { recursive: true });
    await fsPromises.copyFile(sourcePath, targetPath);
    await fsPromises.rm(sourcePath);

    if (!entry.name.endsWith('.map')) {
      moved.push(relativePath);
    }
  }

  return moved;
}

function buildTypesMap(
  movedDts: string[],
  packageName: string,
): Record<string, string> {
  const map = new Map<string, { rank: number; path: string }>();

  movedDts.forEach(relativePath => {
    const normalized = relativePath.split(path.sep).join(path.posix.sep);
    const withoutExtension = normalized.replace(/\.d\.(c|m)?ts$/i, '');
    const key = `./${withoutExtension}`;
    const rank = normalized.endsWith('.d.cts')
      ? 0
      : normalized.endsWith('.d.mts')
        ? 1
        : 2;

    const value = `./types/${normalized}`;
    const existing = map.get(key);

    if (!existing || rank < existing.rank) {
      map.set(key, { rank, path: value });
    }
  });

  const mainTypes = map.get(`./${packageName}`)?.path;

  if (mainTypes && !map.has('.')) {
    map.set('.', { rank: 0, path: mainTypes });
  }

  return Object.fromEntries(
    [...map.entries()].map(([key, value]) => [key, value.path]),
  );
}

function selectMainTypesFile(
  typeMap: Record<string, string>,
  packageName: string,
): string | undefined {
  const typeValues = new Set(Object.values(typeMap));
  const preferredTypes = [
    `./${opts.dir.TYPES}/${packageName}.d.cts`,
    `./${opts.dir.TYPES}/${packageName}.d.mts`,
  ];

  const preferred = preferredTypes.find(typePath => typeValues.has(typePath));
  if (preferred) return preferred;

  return typeMap[`./${packageName}`] ?? typeMap['.'] ?? typeMap['./index'];
}

async function ensureLegacyDtsFile(
  packageDir: string,
  mainTypesPath: string | undefined,
  packageName: string,
): Promise<string | undefined> {
  if (!mainTypesPath) return;

  const sourcePath = path.join(packageDir, mainTypesPath.replace(/^\.\//, ''));
  const legacyDtsPath = path.join(
    packageDir,
    opts.dir.TYPES,
    `${packageName}.d.ts`,
  );

  try {
    await fsPromises.access(sourcePath, fs.constants.R_OK);
  } catch {
    return;
  }

  await fsPromises.mkdir(path.dirname(legacyDtsPath), { recursive: true });
  await fsPromises.copyFile(sourcePath, legacyDtsPath);

  return `./${opts.dir.TYPES}/${packageName}.d.ts`;
}

// eslint-disable-next-line complexity
async function updatePackageJsonTypes(
  packageDir: string,
  packageName: string,
  typeMap: Record<string, string>,
  mainTypesPath?: string,
  legacyDtsPath?: string,
): Promise<void> {
  if (Object.keys(typeMap).length === 0) return;

  const packageJsonPath = vxPath.packageJson(packageName);
  const pkg = JSON.parse(await fsPromises.readFile(packageJsonPath, 'utf8'));
  const distBasePath = `./${opts.dir.DIST}/${packageName}`;

  pkg.main = `${distBasePath}.${opts.format.CJS}`;
  pkg.module = `${distBasePath}.${opts.format.MJS}`;
  pkg.unpkg = `${distBasePath}.${opts.format.MJS}`;
  pkg.jsdelivr = `${distBasePath}.${opts.format.MJS}`;

  const mainTypes =
    mainTypesPath ??
    typeMap[`./${packageName}`] ??
    typeMap['.'] ??
    typeMap['./index'];
  if (mainTypes) pkg.types = mainTypes;

  pkg.exports = updateExports(pkg.exports, typeMap, packageName, {
    mainTypes,
    legacyDtsPath,
  });

  if (pkg.publishConfig?.exports) {
    pkg.publishConfig.exports = updateExports(
      pkg.publishConfig.exports,
      typeMap,
      packageName,
      { mainTypes, legacyDtsPath },
    );
  }

  await fsPromises.writeFile(
    packageJsonPath,
    JSON.stringify(pkg, null, 2) + '\n',
    'utf8',
  );
}

function updateExports(
  exportsField: any,
  typeMap: Record<string, string>,
  packageName: string,
  { mainTypes, legacyDtsPath }: { mainTypes?: string; legacyDtsPath?: string },
): Record<string, any> {
  const exportsMap =
    exportsField && typeof exportsField === 'object' ? { ...exportsField } : {};

  Object.entries(exportsMap).forEach(([exportPath, exportValue]) => {
    if (exportPath === `./${opts.fileNames.PACKAGE_JSON}`) {
      return;
    }

    const normalizedExport =
      exportValue && typeof exportValue === 'object'
        ? { ...exportValue }
        : { default: exportValue };

    const typesKey = exportPath === '.' ? `./${packageName}` : exportPath;
    const typesEntry = typeMap[typesKey] ?? mainTypes;

    if (typesEntry) {
      normalizedExport.types ??= typesEntry;
    }

    exportsMap[exportPath] = normalizedExport;
  });

  Object.entries(typeMap).forEach(([typesKey, typesPath]) => {
    if (typesKey === `./${packageName}` || typesKey === '.') {
      exportsMap[typesKey] ??= typesPath;
    }
  });

  if (legacyDtsPath) {
    exportsMap[`./${packageName}.d.ts`] ??= legacyDtsPath;
  }

  exportsMap[`./${opts.dir.TYPES}/*`] ??= `./${opts.dir.TYPES}/*`;
  exportsMap[`./${opts.dir.DIST}/*`] ??= `./${opts.dir.DIST}/*`;

  return exportsMap;
}

export default createPackageConfig;

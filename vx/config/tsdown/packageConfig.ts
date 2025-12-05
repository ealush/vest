import fs, { promises as fsPromises } from 'fs';
import path from 'path';

import { glob } from 'glob';
import { defineConfig, type UserConfig } from 'tsdown';

import { dir, fileNames, format } from 'vx/opts.js';
import vxPath from 'vx/vxPath.js';

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
      [`@${packageName}`]: `./${dir.SRC}`,
      '@exports': `./${dir.SRC}/${dir.EXPORTS}`,
    },
    clean: [dir.DIST, dir.TYPES],
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
        const typesDir = vxPath.package(packageName, dir.TYPES);

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

        await updatePackageJsonTypes(packageDir, packageName, {
          typeMap,
          mainTypesPath,
          legacyDtsPath,
        });

        await generateExportPolyfills(packageDir, packageName);
      },
    },
    name: packageName,
    outDir: dir.DIST,
    platform: 'node',
    shims: true,
    sourcemap: true,
    tsconfig: vxPath.packageTsConfig(packageName),
  });
}

type ExportsMap = Record<string, string | ExportsEntry>;
type ExportsEntry = {
  default?: string;
  import?: string;
  require?: string;
  types?: string;
  [key: string]: unknown;
};

function addRootExports(
  exportsMap: ExportsMap,
  packageName: string,
): ExportsMap {
  const rootExport = exportsMap[`./${packageName}`] ?? exportsMap['./index'];

  if (rootExport && !exportsMap['.']) {
    exportsMap['.'] = rootExport;
  }

  const packageJson = `./${fileNames.PACKAGE_JSON}`;

  exportsMap[packageJson] ??= packageJson;

  return exportsMap;
}

function addExportsAliases(exportsMap: ExportsMap): ExportsMap {
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

// eslint-disable-next-line complexity
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
    `./${dir.TYPES}/${packageName}.d.cts`,
    `./${dir.TYPES}/${packageName}.d.mts`,
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
  const legacyDtsPath = path.join(packageDir, dir.TYPES, `${packageName}.d.ts`);

  try {
    await fsPromises.access(sourcePath, fs.constants.R_OK);
  } catch {
    return;
  }

  await fsPromises.mkdir(path.dirname(legacyDtsPath), { recursive: true });
  await fsPromises.copyFile(sourcePath, legacyDtsPath);

  return `./${dir.TYPES}/${packageName}.d.ts`;
}

// eslint-disable-next-line complexity
async function updatePackageJsonTypes(
  packageDir: string,
  packageName: string,
  {
    typeMap,
    mainTypesPath,
    legacyDtsPath,
  }: {
    typeMap: Record<string, string>;
    mainTypesPath?: string;
    legacyDtsPath?: string;
  },
): Promise<void> {
  if (Object.keys(typeMap).length === 0) return;

  const packageJsonPath = vxPath.packageJson(packageName);
  const pkg = JSON.parse(await fsPromises.readFile(packageJsonPath, 'utf8'));
  const distBasePath = `./${dir.DIST}/${packageName}`;

  pkg.main = `${distBasePath}.${format.CJS}`;
  pkg.module = `${distBasePath}.${format.MJS}`;
  pkg.unpkg = `${distBasePath}.${format.MJS}`;
  pkg.jsdelivr = `${distBasePath}.${format.MJS}`;

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
  exportsField: ExportsMap | undefined,
  typeMap: Record<string, string>,
  packageName: string,
  options: { mainTypes?: string; legacyDtsPath?: string },
): ExportsMap {
  const { mainTypes, legacyDtsPath } = options;
  const exportsMap: ExportsMap =
    exportsField && typeof exportsField === 'object' ? { ...exportsField } : {};

  updateExistingExports(exportsMap, typeMap, packageName, mainTypes);
  addTypeMapEntries(exportsMap, typeMap, packageName);
  addLegacyAndWildcardEntries(exportsMap, packageName, legacyDtsPath);

  return exportsMap;
}

function updateExistingExports(
  exportsMap: ExportsMap,
  typeMap: Record<string, string>,
  packageName: string,
  mainTypes?: string,
): void {
  Object.entries(exportsMap).forEach(([exportPath, exportValue]) => {
    if (exportPath === `./${fileNames.PACKAGE_JSON}`) {
      return;
    }
    exportsMap[exportPath] = normalizeExport({
      exportPath,
      exportValue,
      mainTypes,
      packageName,
      typeMap,
    });
  });
}

function normalizeExport({
  exportPath,
  exportValue,
  mainTypes,
  packageName,
  typeMap,
}: {
  exportPath: string;
  exportValue: string | ExportsEntry;
  typeMap: Record<string, string>;
  packageName: string;
  mainTypes?: string;
}): ExportsEntry {
  const typesKey = getTypesKey(exportPath, packageName);
  const typesEntry = getTypesEntry(typesKey, typeMap, mainTypes);
  const normalizedExport = cloneExport(exportValue);
  return placeTypesFirst(normalizedExport, typesEntry);
}

function cloneExport(exportValue: string | ExportsEntry): ExportsEntry {
  return exportValue && typeof exportValue === 'object'
    ? { ...exportValue }
    : { default: exportValue };
}

function placeTypesFirst(
  exportEntry: ExportsEntry,
  typesEntry?: string,
): ExportsEntry {
  const { types, ...rest } = exportEntry;
  const resolvedTypes = typesEntry ?? types;

  if (!resolvedTypes) {
    return exportEntry;
  }

  return { types: resolvedTypes, ...rest };
}

function getTypesKey(exportPath: string, packageName: string): string {
  return exportPath === '.' ? `./${packageName}` : exportPath;
}

function getTypesEntry(
  typesKey: string,
  typeMap: Record<string, string>,
  mainTypes?: string,
): string | undefined {
  return typeMap[typesKey] ?? mainTypes;
}

function addTypeMapEntries(
  exportsMap: ExportsMap,
  typeMap: Record<string, string>,
  packageName: string,
): void {
  Object.entries(typeMap).forEach(([typesKey, typesPath]) => {
    if (typesKey === `./${packageName}` || typesKey === '.') {
      exportsMap[typesKey] ??= typesPath;
    }
  });
}

function addLegacyAndWildcardEntries(
  exportsMap: ExportsMap,
  packageName: string,
  legacyDtsPath?: string,
): void {
  if (legacyDtsPath) {
    exportsMap[`./${packageName}.d.ts`] ??= legacyDtsPath;
  }
  exportsMap[`./${dir.TYPES}/*`] ??= `./${dir.TYPES}/*`;
  exportsMap[`./${dir.DIST}/*`] ??= `./${dir.DIST}/*`;
}

export default createPackageConfig;

async function generateExportPolyfills(
  packageDir: string,
  packageName: string,
): Promise<void> {
  const exportsPattern = vxPath.packageSrcExports(packageName, '*.ts');
  const exportsFiles = await glob(exportsPattern);

  for (const exportFile of exportsFiles) {
    const exportName = path.basename(exportFile, '.ts');
    const exportDir = path.join(packageDir, exportName);

    await fsPromises.mkdir(exportDir, { recursive: true });

    const packageJsonContent = {
      exports: {
        '.': {
          default: `../${dir.DIST}/${dir.EXPORTS}/${exportName}.mjs`,
          import: `../${dir.DIST}/${dir.EXPORTS}/${exportName}.mjs`,
          require: `../${dir.DIST}/${dir.EXPORTS}/${exportName}.cjs`,
          types: `../${dir.TYPES}/${dir.EXPORTS}/${exportName}.d.mts`,
        },
      },
      main: `../${dir.DIST}/${dir.EXPORTS}/${exportName}.cjs`,
      module: `../${dir.DIST}/${dir.EXPORTS}/${exportName}.mjs`,
      type: 'module',
      types: `../${dir.TYPES}/${dir.EXPORTS}/${exportName}.d.mts`,
    };

    await fsPromises.writeFile(
      path.join(exportDir, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2) + '\n',
    );
  }
}

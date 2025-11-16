import fs, { promises as fsPromises } from 'fs';
import path from 'path';

import { defineConfig, type UserConfig } from 'tsdown';

type PackageConfigOptions = {
  packageDir: string;
  devExports?: boolean | string;
};

function addRootExports(
  exportsMap: Record<string, any>,
  packageName: string,
): Record<string, any> {
  const rootExport = exportsMap[`./${packageName}`] ?? exportsMap['./index'];

  if (rootExport && !exportsMap['.']) {
    exportsMap['.'] = rootExport;
  }

  if (!exportsMap['./package.json']) {
    exportsMap['./package.json'] = './package.json';
  }

  return exportsMap;
}

function readPackageName(packageDir: string): string {
  const pkgJsonPath = path.join(packageDir, 'package.json');
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

async function updatePackageJsonTypes(
  packageDir: string,
  packageName: string,
  typeMap: Record<string, string>,
): Promise<void> {
  if (Object.keys(typeMap).length === 0) {
    return;
  }

  const packageJsonPath = path.join(packageDir, 'package.json');
  const pkg = JSON.parse(await fsPromises.readFile(packageJsonPath, 'utf8'));

  const distBasePath = `./dist/${packageName}`;

  pkg.main = `${distBasePath}.cjs`;
  pkg.module = `${distBasePath}.mjs`;
  pkg.unpkg = `${distBasePath}.mjs`;
  pkg.jsdelivr = `${distBasePath}.mjs`;

  const mainTypes =
    typeMap[`./${packageName}`] ?? typeMap['.'] ?? typeMap['./index'];

  if (mainTypes) {
    pkg.types = mainTypes;
  }

  const publishExports = pkg.publishConfig?.exports;

  if (publishExports && typeof publishExports === 'object') {
    Object.entries(publishExports).forEach(([exportPath, exportValue]) => {
      const typesKey = exportPath === '.' ? `./${packageName}` : exportPath;
      const typesEntry = typeMap[typesKey];

      if (!typesEntry) {
        return;
      }

      const normalizedExport =
        exportValue && typeof exportValue === 'object'
          ? exportValue
          : { default: exportValue };

      publishExports[exportPath] = { ...normalizedExport, types: typesEntry };
    });
  }

  await fsPromises.writeFile(
    packageJsonPath,
    JSON.stringify(pkg, null, 2) + '\n',
    'utf8',
  );
}

export function createPackageConfig({
  packageDir,
  devExports = true,
}: PackageConfigOptions): UserConfig {
  const packageName = readPackageName(packageDir);
  const mainEntry = `src/${packageName}.ts`;

  return defineConfig({
    name: packageName,
    cwd: packageDir,
    entry: [mainEntry, 'src/exports/*.ts'],
    tsconfig: './tsconfig.json',
    outDir: 'dist',
    clean: ['dist', 'types'],
    sourcemap: true,
    format: ['esm', 'cjs'],
    platform: 'node',
    shims: true,
    hash: true,
    dts: {
      outDir: 'types',
      sourcemap: true,
      resolver: 'tsc',
    },
    exports: {
      all: true,
      devExports,
      customExports(exportsMap) {
        return addRootExports(exportsMap, packageName);
      },
    },
    alias: {
      [`@${packageName}`]: './src',
      '@exports': './src/exports',
    },
    hooks: {
      async 'build:done'({ options }) {
        const distDir = options.outDir;
        const typesDir = path.join(packageDir, 'types');

        const movedDts = await relocateDtsFiles(distDir, typesDir);
        const typeMap = buildTypesMap(movedDts, packageName);

        await updatePackageJsonTypes(packageDir, packageName, typeMap);
      },
    },
  });
}

export default createPackageConfig;

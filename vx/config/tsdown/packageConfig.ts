import fs, { promises as fsPromises } from 'fs';
import path from 'path';

import { glob } from 'glob';
import { defineConfig, type UserConfig } from 'tsdown';

import { dir, fileNames, format } from 'vx/opts.js';
import vxPath from 'vx/vxPath.js';

/**
 * Configuration options for creating a package build config.
 */
type PackageConfigOptions = {
  /** Absolute path to the package directory */
  packageDir: string;
  /** Whether to include dev exports in the build */
  devExports?: boolean | string;
};

const processedOutDirs = new Set<string>();

/**
 * Creates a tsdown build configuration for a package.
 *
 * This is the main entry point for configuring how packages are built.
 * It sets up entry points, output directories, type generation, and most importantly,
 * the package.json exports field through the customExports hook.
 *
 * @param options - Configuration options for the package
 * @returns A tsdown UserConfig object
 */
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

/**
 * Represents the package.json exports field structure.
 * Keys are export paths like "./foo" or ".", values are either strings or export condition objects.
 */
type ExportsMap = Record<string, string | ExportsEntry>;

/**
 * Represents a single export entry with conditional exports.
 * Supports "types", "import", "require", "default", and other custom conditions.
 */
type ExportsEntry = {
  default?: string;
  import?: string;
  require?: string;
  types?: string;
  [key: string]: unknown;
};

/**
 * Adds the root "." export to the exports map.
 *
 * Looks for either `./${packageName}` or `./index` in the exports map and uses it
 * as the root export. Also ensures package.json is exported.
 *
 * @param exportsMap - The current exports map
 * @param packageName - Name of the package (e.g., "vest-utils")
 * @returns The updated exports map with root exports added
 */
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

/**
 * Creates shorthand aliases for exports that start with "./exports/".
 *
 * For example, if there's an export "./exports/minifyObject", this function
 * will create an alias "./minifyObject" that points to the same files.
 * This allows users to import using either:
 * - `import { x } from 'vest-utils/exports/minifyObject'` (full path)
 * - `import { x } from 'vest-utils/minifyObject'` (shorthand)
 *
 * The function deep clones the export entries to ensure each alias has its own
 * object, preventing issues when types are updated later in the build process.
 *
 * @param exportsMap - The current exports map
 * @returns The updated exports map with shorthand aliases added
 */
// eslint-disable-next-line complexity
function addExportsAliases(exportsMap: ExportsMap): ExportsMap {
  const aliasPrefix = './exports/';

  for (const fullPath of Object.keys(exportsMap)) {
    // Skip if not an exports/ path
    if (!fullPath.startsWith(aliasPrefix)) {
      continue;
    }

    // Create shorthand path: "./exports/foo" -> "./foo"
    const shorthandPath = `./${fullPath.slice(aliasPrefix.length)}`;

    // Skip if shorthand already exists
    if (exportsMap[shorthandPath]) {
      continue;
    }

    // Deep clone to prevent shared object references
    const originalExport = exportsMap[fullPath];
    exportsMap[shorthandPath] =
      typeof originalExport === 'object' && originalExport
        ? { ...originalExport }
        : originalExport;
  }

  return exportsMap;
}

/**
 * Reads the package name from the package.json file.
 *
 * @param packageDir - Absolute path to the package directory
 * @returns The package name from package.json
 */
function readPackageName(packageDir: string): string {
  const pkgJsonPath = vxPath.packageJson(path.basename(packageDir));
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  return pkgJson.name;
}

/**
 * Recursively moves .d.ts files from the dist directory to the types directory.
 *
 * After tsdown generates type definitions alongside the compiled code in dist/,
 * this function moves them to a dedicated types/ directory for cleaner organization.
 *
 * @param distDir - Source directory containing .d.ts files
 * @param typesDir - Destination directory for type files
 * @param relativePrefix - Current relative path prefix (used for recursion)
 * @returns Array of relative paths to the moved .d.ts files
 */
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

/**
 * Builds a map of export paths to their corresponding type definition files.
 *
 * For each .d.ts file, creates an entry mapping the export path (e.g., "./exports/foo")
 * to the types file path (e.g., "./types/exports/foo.d.cts").
 *
 * Prioritizes .d.cts files over .d.mts and .d.ts files for better CommonJS compatibility.
 *
 * @param movedDts - Array of relative paths to moved .d.ts files
 * @param packageName - Name of the package
 * @returns Map of export paths to type file paths
 */
// eslint-disable-next-line complexity
function buildTypesMap(
  movedDts: string[],
  packageName: string,
): Record<string, string> {
  // Helper to determine file priority (lower is better)
  const getFilePriority = (filename: string): number => {
    if (filename.endsWith('.d.cts')) return 0; // Prefer .d.cts (CommonJS)
    if (filename.endsWith('.d.mts')) return 1; // Then .d.mts (ESM)
    return 2; // Finally .d.ts (generic)
  };

  const typePathsByExport = new Map<
    string,
    { priority: number; typesPath: string }
  >();

  // Build map of export paths to their best type file
  for (const relativePath of movedDts) {
    const normalizedPath = relativePath.split(path.sep).join(path.posix.sep);
    const exportPath = `./${normalizedPath.replace(/\.d\.(c|m)?ts$/i, '')}`;
    const typesPath = `./types/${normalizedPath}`;
    const priority = getFilePriority(normalizedPath);

    const existing = typePathsByExport.get(exportPath);
    if (!existing || priority < existing.priority) {
      typePathsByExport.set(exportPath, { priority, typesPath });
    }
  }

  // Add root "." export if it doesn't exist
  const mainTypesEntry = typePathsByExport.get(`./${packageName}`);
  if (mainTypesEntry && !typePathsByExport.has('.')) {
    typePathsByExport.set('.', {
      priority: 0,
      typesPath: mainTypesEntry.typesPath,
    });
  }

  // Convert to simple path map
  return Object.fromEntries(
    [...typePathsByExport.entries()].map(([key, value]) => [
      key,
      value.typesPath,
    ]),
  );
}

/**
 * Selects the main types file for the package.
 *
 * Prefers .d.cts files for the package name, falling back to .d.mts, then
 * the root "." export, then "./index".
 *
 * @param typeMap - Map of export paths to type file paths
 * @param packageName - Name of the package
 * @returns Path to the main types file, or undefined if not found
 */
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

/**
 * Creates a legacy .d.ts file for backwards compatibility.
 *
 * Some tools expect a .d.ts file (not .d.cts or .d.mts), so this function
 * copies the main types file to a .d.ts version.
 *
 * @param packageDir - Absolute path to the package directory
 * @param mainTypesPath - Path to the main types file
 * @param packageName - Name of the package
 * @returns Path to the legacy .d.ts file, or undefined if not created
 */
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

/**
 * Updates the package.json file with type paths and exports configuration.
 *
 * This is called after the build completes to update package.json with:
 * - Main entry points (main, module, types)
 * - Exports field with proper type paths
 * - publishConfig.exports if it exists
 *
 * @param packageDir - Absolute path to the package directory
 * @param packageName - Name of the package
 * @param options - Type map, main types path, and legacy .d.ts path
 */
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

/**
 * Updates an exports field with proper type paths.
 *
 * Takes the existing exports field (which has the structure from tsdown's customExports)
 * and enriches it with type paths from the typeMap.
 *
 * @param exportsField - Existing exports field from package.json
 * @param typeMap - Map of export paths to type file paths
 * @param packageName - Name of the package
 * @param options - Main types path and legacy .d.ts path
 * @returns Updated exports map with type paths
 */
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

/**
 * Updates all existing exports in the map with their corresponding type paths.
 *
 * Iterates through each export and normalizes it by adding the correct types field.
 *
 * @param exportsMap - The exports map to update (mutated in place)
 * @param typeMap - Map of export paths to type file paths
 * @param packageName - Name of the package
 * @param mainTypes - Path to the main types file
 */
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

/**
 * Normalizes a single export entry by adding the correct types field.
 *
 * Converts string exports to objects, looks up the correct types path,
 * and ensures the types field is placed first in the export object.
 *
 * @param params - Export normalization parameters
 * @returns Normalized export entry with types field
 */
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
  // Determine the types key and path
  const typesKey = exportPath === '.' ? `./${packageName}` : exportPath;
  const typesPath = getTypesEntry(typesKey, typeMap, mainTypes);

  // Convert string exports to object format
  const exportEntry: ExportsEntry =
    typeof exportValue === 'object' && exportValue
      ? { ...exportValue }
      : { default: exportValue };

  // Add types field if we have a types path (types must be first for proper resolution)
  if (!typesPath) {
    return exportEntry;
  }

  const { types: _, ...rest } = exportEntry;
  return { types: typesPath, ...rest };
}

/**
 * Retrieves the types path for a given export key.
 *
 * First tries the direct key, then checks if there's a corresponding
 * "./exports/" prefixed version. This ensures shorthand aliases like
 * "./minifyObject" correctly resolve to "./types/exports/minifyObject.d.cts"
 * instead of falling back to the main types.
 *
 * @param typesKey - Key to look up in the typeMap
 * @param typeMap - Map of export paths to type file paths
 * @param mainTypes - Fallback main types path
 * @returns Path to the types file, or undefined if not found
 */
function getTypesEntry(
  typesKey: string,
  typeMap: Record<string, string>,
  mainTypes?: string,
): string | undefined {
  // Try direct lookup first
  if (typeMap[typesKey]) {
    return typeMap[typesKey];
  }

  // For shorthand paths ("./foo"), check if "./exports/foo" exists
  // Skip for root "." and paths already starting with "./exports/"
  const isShorthandPath =
    typesKey !== '.' && !typesKey.startsWith('./exports/');
  if (isShorthandPath) {
    const fullExportPath = `./exports${typesKey.slice(1)}`;
    if (typeMap[fullExportPath]) {
      return typeMap[fullExportPath];
    }
  }

  // Fall back to main types
  return mainTypes;
}

/**
 * Adds entries from the typeMap to the exports map if they don't exist.
 *
 * Ensures that the package name and root exports are present in the exports map.
 *
 * @param exportsMap - The exports map to update (mutated in place)
 * @param typeMap - Map of export paths to type file paths
 * @param packageName - Name of the package
 */
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

/**
 * Adds legacy .d.ts export and wildcard exports for types and dist directories.
 *
 * Wildcard exports allow direct access to files in types/ and dist/ directories.
 *
 * @param exportsMap - The exports map to update (mutated in place)
 * @param packageName - Name of the package
 * @param legacyDtsPath - Path to the legacy .d.ts file (if created)
 */
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

/**
 * Generates polyfill package.json files for each export.
 *
 * For each export like "minifyObject", creates a directory with a package.json
 * that points to the built files. This allows imports like:
 * `import { x } from 'vest-utils/minifyObject'` (using Node's package.json resolution)
 *
 * @param packageDir - Absolute path to the package directory
 * @param packageName - Name of the package
 */
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

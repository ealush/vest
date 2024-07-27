const fs = require('fs');
const path = require('path');

const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');

const vxPath = {};

vxPath.vxRoot = () => {
  return vxPath.closest(process.cwd(), (current, breakout) => {
    const pkgJsonPath = path.resolve(current, opts.fileNames.PACKAGE_JSON);

    if (!fs.existsSync(pkgJsonPath)) {
      return;
    }

    const pkgJson = require(pkgJsonPath);

    if (pkgJson[opts.dir.VX]) {
      breakout(current);
    }
  });
};

vxPath.packageNameFromPath = pathSegment => {
  // ./packages/vest/src/core/isolate/isolates/skipWhen.ts

  const packagesPosition = pathSegment.indexOf(opts.dir.PACKAGES); // 2
  const withoutDir = pathSegment.substring(
    packagesPosition + opts.dir.PACKAGES.length,
  ); // /vest/src/core/isolate/isolates/skipWhen.ts
  return withoutDir.split(path.sep)[1]; //vest
};

vxPath.package = (pkgName = usePackage(), ...args) => {
  return path.resolve(vxPath.PACKAGES_PATH, pkgName, ...args.filter(Boolean));
};

vxPath.packageDist = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.DIST, ...args);
};

vxPath.packageConfigPath = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.CONFIG, ...args);
};

vxPath.packageSrc = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.SRC, ...args);
};

vxPath.packageSrcExports = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.SRC, opts.dir.EXPORTS, ...args);
};

vxPath.packageTsConfig = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.TSCONFIG_JSON);
};

vxPath.packageJson = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.PACKAGE_JSON);
};

vxPath.packageNpmIgnore = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.NPM_IGNORE);
};

vxPath.closest = (start, predicate) => {
  let current = start;
  let broke = false;
  let index = 0;
  let prev;
  let match;

  while (current !== prev && !broke) {
    predicate(current, breakout, index, prev);
    prev = current;
    current = path.resolve(current, '..');
    index++;
  }

  return match;

  function breakout(breakValue) {
    if (breakValue) {
      match = breakValue;
    }

    broke = true;
  }
};

vxPath.rel = (to, from = vxPath.ROOT_PATH) => {
  return ['.', path.relative(from, to)].join(path.sep);
};

vxPath.ROOT_PATH = vxPath.vxRoot();

vxPath.VX_ROOT_PATH = path.resolve(vxPath.ROOT_PATH, opts.dir.VX);

vxPath.VX_CONFIG_PATH = path.resolve(vxPath.VX_ROOT_PATH, opts.dir.CONFIG);

vxPath.VX_SCRIPTS_PATH = path.resolve(vxPath.VX_ROOT_PATH, opts.dir.SCRIPTS);

vxPath.VX_COMMANDS_PATH = path.resolve(vxPath.VX_ROOT_PATH, opts.dir.COMMANDS);

vxPath.ROLLUP_CONFIG_PATH = path.resolve(
  vxPath.VX_CONFIG_PATH,
  opts.dir.ROLLUP,
  opts.fileNames.ROLLUP_CONFIG,
);

vxPath.JEST_CONFIG_PATH = path.resolve(vxPath.VX_CONFIG_PATH, opts.dir.JEST);

vxPath.JEST_CONFIG_FILE_PATH = path.resolve(
  vxPath.JEST_CONFIG_PATH,
  opts.fileNames.JEST_CONFIG,
);

vxPath.TSCONFIG_PATH = path.resolve(
  vxPath.ROOT_PATH,
  opts.fileNames.TSCONFIG_JSON,
);

vxPath.PACKAGES_PATH = path.resolve(vxPath.ROOT_PATH, opts.dir.PACKAGES);

module.exports = vxPath;

const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

const matches = glob.sync(vxPath.rel(vxPath.packageSrc('*', '**/*.ts')), {
  cwd: vxPath.ROOT_PATH,
  absolute: false,
  ignore: [
    vxPath.rel(vxPath.packageSrc('*', '**/*/index.ts')),
    vxPath.rel(vxPath.packageSrc('*', `**/${opts.dir.TESTS}/**/*`)),
  ],
});

const dupesPerPackage = matches.reduce(
  (packages, current) => {
    const basename = path.basename(current);
    const package = vxPath.packageNameFromPath(current);

    const existing = packages[package].existing;

    existing[basename] = (existing[basename] || 0) + 1;
    if (existing[basename] > 1) {
      packages[package].duplicates.add(basename);
    }

    return packages;
  },

  packageNames.list.reduce(
    (accumulator, package) =>
      Object.assign(accumulator, {
        [package]: { existing: {}, duplicates: new Set() },
      }),
    {}
  )
);

const verifiedDuplicates = Object.entries(dupesPerPackage).reduce(
  (err, [package, { duplicates }]) => {
    if (duplicates.size > 0) {
      err.push(`  - ${package}: ${[...duplicates].join(', ')} \n`);
    }

    return err;
  },
  []
);

if (verifiedDuplicates.length > 0) {
  throw new Error(
    'Found duplicate module names: \n- ' + verifiedDuplicates.join('\n')
  );
}

const output = Object.values(
  matches.reduce((accumulator, relative) => {
    const name = path.basename(relative, '.ts');
    const package = vxPath.packageNameFromPath(relative);

    accumulator[package] = accumulator[package] || {
      packageName: package,
      modules: [],
      entry: null,
    };

    if (name === package) {
      accumulator[package].entry = {
        absolute: path.join(vxPath.ROOT_PATH, relative),
        name,
        relative,
      };
    }

    accumulator[package].modules.push({
      absolute: path.join(vxPath.ROOT_PATH, relative),
      name,
      package,
      relative,
    });

    return accumulator;
  }, {})
);

module.exports = () => [...output];

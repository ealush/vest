const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const vxPath = require('vx/vxPath');

const matches = glob.sync(vxPath.rel(vxPath.packageSrc('*', '**/*.ts')), {
  cwd: vxPath.ROOT_PATH,
  absolute: false,
  ignore: [
    vxPath.rel(vxPath.packageSrc('*', '**/*/index.ts')),
    vxPath.rel(vxPath.packageSrc('*', `**/${opts.dir.TESTS}/**/*`)),
  ],
});

const { duplicates } = matches.reduce(
  ({ existing, duplicates }, current) => {
    const basename = path.basename(current);

    existing[basename] = (existing[basename] || 0) + 1;
    if (existing[basename] > 1) {
      duplicates.add(basename);
    }

    return { existing, duplicates };
  },
  { existing: {}, duplicates: new Set() }
);

if (duplicates.size > 0) {
  throw new Error(
    'Found duplicate module names: \n- ' + [...duplicates].join('\n- ')
  );
}

const output = matches.reduce((accumulator, relative) => {
  const name = path.basename(relative, '.ts');

  return accumulator.concat({
    name,
    relative,
    absolute: path.join(vxPath.ROOT_PATH, relative),
  });
}, []);

module.exports = () => [].concat(output);

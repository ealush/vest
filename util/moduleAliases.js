const path = require('path');

const glob = require('glob');

const { ROOT_PATH } = require('./filePaths');

const matches = glob.sync('./packages/*/src/**/*.{m,js}', {
  cwd: ROOT_PATH,
  absolute: false,
  ignore: [
    './packages/*/src/**/index.{m,js}',
    './packages/*/src/**/*.{test,spec}.{m,js}',
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

module.exports = matches.reduce((accumulator, relative) => {
  const name = path.basename(relative, '.js');

  return accumulator.concat({
    name,
    relative,
    absolute: path.join(ROOT_PATH, relative),
  });
}, []);

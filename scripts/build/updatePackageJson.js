const fs = require('fs');

const glob = require('glob');

const { packageJson, envNames, packageDist } = require('../../util');

function updatePackageJson(packageName) {
  const distPath = packageDist(packageName);
  const mainExport = `./${packageName}.js`;

  const exports = [mainExport, './package.json'].concat(
    glob.sync('./**/*.{js,mjs}', { cwd: distPath })
  );

  const pkgJson = packageJson(packageName);

  pkgJson.exports = exports.reduce(
    (exports, file) => Object.assign(exports, { [file]: file }),
    {}
  );

  const cjs = exports.find(file =>
    file.includes(`${packageName}.cjs.${envNames.PRODUCTION}.js`)
  );
  const mjs = exports.find(file =>
    file.includes(`${packageName}.mjs.${envNames.PRODUCTION}.js`)
  );

  /* eslint-disable sort-keys */
  pkgJson.exports['.'] = {
    browser: mainExport,
    import: mjs,
    require: cjs,
    node: cjs,
    default: cjs,
  };

  pkgJson.main = pkgJson.browser = mainExport;
  pkgJson.module = mjs;

  fs.writeFileSync(
    packageJson.path(packageName),
    JSON.stringify(pkgJson, null, 2),
    'utf8'
  );
}

module.exports = updatePackageJson;

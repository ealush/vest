const fs = require('fs');
const path = require('path');

const glob = require('glob');

const { packageJson, envNames, packageDist } = require('../../util');

function updatePackageJson(packageName) {
  const distPath = packageDist(packageName);
  const mainExport = `./${packageName}.js`;

  const exports = [mainExport, './package.json'].concat(
    glob.sync('./**/*.{js,mjs}', { cwd: distPath })
  );

  const pkgJson = packageJson(packageName);

  pkgJson.exports = exports.reduce((exports, file) => {
    const ext = path.extname(file);

    return Object.assign(exports, {
      [file]: file,
      [file.slice(0, -ext.length)]: file,
    });
  }, {});

  const cjs = exports.find(file =>
    file.includes(`${packageName}.cjs.${envNames.PRODUCTION}.js`)
  );
  const es = exports.find(file =>
    file.includes(`${packageName}.es.${envNames.PRODUCTION}.js`)
  );

  /* eslint-disable sort-keys */
  pkgJson.exports['.'] = {
    browser: es,
    import: es,
    require: cjs,
    node: cjs,
    default: cjs,
  };

  pkgJson.main = pkgJson.browser = mainExport;
  pkgJson.module = es;

  fs.writeFileSync(
    packageJson.path(packageName),
    JSON.stringify(pkgJson, null, 2),
    'utf8'
  );
}

module.exports = updatePackageJson;

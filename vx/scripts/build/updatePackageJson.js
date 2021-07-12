const fs = require('fs');
const path = require('path');

const glob = require('glob');

const packageJson = require('../../util/packageJson');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function updatePackageJson(pkgName = packageName()) {
  const distPath = vxPath.packageDist(pkgName);
  const mainExport = `./${pkgName}.js`;

  const exports = [mainExport, './package.json'].concat(
    glob.sync('./**/*.{js,mjs}', { cwd: distPath })
  );

  const pkgJson = packageJson(pkgName);

  pkgJson.exports = exports.reduce((exports, file) => {
    const ext = path.extname(file);

    return Object.assign(exports, {
      [file]: file,
      [file.slice(0, -ext.length)]: file,
    });
  }, {});

  const cjs = exports.find(file =>
    file.includes(`${pkgName}.cjs.${opts.env.PRODUCTION}.js`)
  );
  const es = exports.find(file =>
    file.includes(`${pkgName}.es.${opts.env.PRODUCTION}.js`)
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
    vxPath.packageJson(pkgName),
    JSON.stringify(pkgJson, null, 2),
    'utf8'
  );
}

module.exports = updatePackageJson;

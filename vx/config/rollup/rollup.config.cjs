const fs = require('fs');

const { format, disallowExternals } = require('./format');
const getPlugins = require('./getPlugins');

const opts = require('vx/opts');
const concatTruthy = require('vx/util/concatTruthy');
const joinTruthy = require('vx/util/joinTruthy');
const listExportedModules = require('vx/util/listExportedModules');
const moduleAliases = require('vx/util/moduleAliases')();
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const buildSingle = JSON.parse(
  process.env.ROLLUP_WATCH ?? process.env.VX_BUILD_SINGLE ?? false
);

module.exports = cleanupConfig(
  concatTruthy(!buildSingle && opts.env.PRODUCTION, opts.env.DEVELOPMENT).map(
    env => {
      const packageName = usePackage();

      return [].concat(
        genBaseConfig({ env, packageName }),
        genExportsConfig(usePackage(), env)
      );
    }
  )
);

function cleanupConfig(configs) {
  return []
    .concat(...configs)
    .filter(Boolean)
    .map(({ input, output, plugins, external }) => ({
      external,
      input,
      output,
      plugins,
    }));
}

function genBaseConfig({
  env,
  packageName,
  moduleName = usePackage(),
  namespace = undefined,
}) {
  return {
    env,
    // This turns the installed "internal" dependencies into external dependencies
    external: [
      ...Object.keys(
        disallowExternals ? {} : packageJson()?.dependencies ?? {}
      ),
      moduleName === usePackage() ? null : usePackage(),
    ].filter(Boolean),

    input: getInputFile(moduleName),
    output: format.map(format =>
      genOutput({ env, format, moduleName, namespace })
    ),
    plugins: getPlugins({ env, moduleName, namespace, packageName }),
  };
}

function genExportsConfig(pkgName, env) {
  return listExportedModules(pkgName).map(([moduleName, namespace]) =>
    genBaseConfig({ env, moduleName, namespace })
  );
}

function genOutput({
  moduleName = usePackage(),
  env,
  namespace = undefined,
  format,
} = {}) {
  const base = {
    exports: 'auto',
    name: moduleName,
  };

  // creates "globals" from the installed internal packages
  const globals = Object.keys(
    disallowExternals ? {} : packageJson()?.dependencies ?? {}
  ).reduce((g, c) => Object.assign(g, { [c]: c }), {
    ...{ [usePackage()]: usePackage() },
  });

  return {
    ...base,
    file: vxPath.packageDist(
      usePackage(),
      format,
      namespace,
      joinTruthy([moduleName, env, 'js'], '.')
    ),
    format,
    globals,
  };
}

function getInputFile(moduleName = usePackage()) {
  const modulePath = moduleAliases.find(ref => ref.name === moduleName);

  if (!(modulePath?.absolute && fs.existsSync(modulePath.absolute))) {
    throw new Error('unable to find module path for ' + moduleName);
  }

  return modulePath.absolute;
}

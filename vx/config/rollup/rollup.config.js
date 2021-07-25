const fs = require('fs');
const path = require('path');

const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const { default: babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const glob = require('glob');
const { terser } = require('rollup-plugin-terser');
const ts = require('rollup-plugin-ts');

const concatTruthy = require('../../util/concatTruthy');
const joinTruthy = require('../../util/joinTruthy');
const packageJson = require('../../util/packageJson');

const addModulePackageJson = require('./plugins/addModulePackageJson');
const writeCJSMain = require('./plugins/writeCJSMain');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const moduleAliases = require('vx/util/moduleAliases')();
const vxPath = require('vx/vxPath');

const isWatchModeOn = JSON.parse(process.env.ROLLUP_WATCH ?? false);

module.exports = cleanupConfig(
  concatTruthy(!isWatchModeOn && opts.env.PRODUCTION, opts.env.DEVELOPMENT).map(
    env => {
      const customConfigPath = vxPath.packageConfigPath(
        packageName(),
        'vx.build.js'
      );

      let customConfig;

      if (fs.existsSync(customConfigPath)) {
        customConfig = require(customConfigPath);
      }

      return [].concat(
        genBaseConfig({ env }),
        genExports(packageName(), env),
        customConfig?.({
          getInputFile,
          getPlugins: (options = {}) => getPlugins({ env, ...options }),
          genOutput: (options = {}) => genOutput({ env, ...options }),
        }) ?? []
      );
    }
  )
);

function cleanupConfig(configs) {
  return []
    .concat(...configs)
    .filter(Boolean)
    .map(({ input, output, plugins }) => ({ input, output, plugins }));
}

function genBaseConfig({ env, moduleName = packageName() }) {
  return {
    env,
    input: getInputFile(moduleName),
    output: genOutput({ env, moduleName }),
    plugins: getPlugins({ env, moduleName }),
  };
}

function genExports(pkgName, env) {
  return glob
    .sync(vxPath.packageSrc(pkgName, opts.dir.EXPORTS, '*.ts'))
    .map(file =>
      genBaseConfig({ env, moduleName: path.basename(file, '.ts') })
    );
}

function genOutput({ moduleName = packageName(), env } = {}) {
  const base = {
    exports: 'auto',
    name: moduleName,
  };

  return [
    outputByFormat(opts.format.ES),
    outputByFormat(opts.format.UMD),
    outputByFormat(opts.format.CJS),
  ];

  function outputByFormat(format) {
    return {
      ...base,
      format,
      file: vxPath.packageDist(
        packageName(),
        format,
        joinTruthy([moduleName, env, 'js'], '.')
      ),
    };
  }
}

function getInputFile(moduleName = packageName()) {
  const modulePath = moduleAliases.find(ref => ref.name === moduleName);

  if (!(modulePath?.absolute && fs.existsSync(modulePath.absolute))) {
    throw new Error('unable to find module path for ' + moduleName);
  }

  return modulePath.absolute;
}

function getPlugins({
  env = opts.env.PRODUCTION,
  moduleName = packageName(),
} = {}) {
  const plugins = [
    replace({
      preventAssignment: true,
      values: {
        __LIB_VERSION__: JSON.stringify(packageJson().version),
        LIBRARY_NAME: moduleName,
        __DEV__: env === opts.env.DEVELOPMENT,
      },
    }),
    ts({
      hook: {
        outputPath: (path, kind) => {
          const basePath = vxPath.package(
            packageName(),
            opts.dir.TYPES,
            moduleName + '.d.ts'
          );

          if (kind === 'declaration') return basePath;
          if (kind === 'declarationMap') return basePath + '.map';
        },
      },
    }),
    babel({
      configFile: vxPath.BABEL_CONFIG_PATH,
      babelHelpers: 'bundled',
      envName: env,
    }),
  ];

  if (env === opts.env.PRODUCTION) {
    plugins.push(
      compiler(),
      terser(),
      writeCJSMain({
        isMain: moduleName === packageName(),
        rootPath: vxPath.package(),
      }),
      addModulePackageJson()
    );
  }

  return plugins;
}

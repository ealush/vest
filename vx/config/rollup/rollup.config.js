const fs = require('fs');

const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const { default: babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');
const ts = require('rollup-plugin-ts');

const joinTruthy = require('../../util/joinTruthy');
const packageJson = require('../../util/packageJson');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

const configs = [opts.env.PRODUCTION, opts.env.DEVELOPMENT].map(env =>
  genBaseConfig({ env })
);

module.exports = () => {
  const customConfigPath = vxPath.packageConfigPath(
    packageName(),
    'vx.build.js'
  );
  let customConfig = baseConfig => baseConfig;
  if (fs.existsSync(customConfigPath)) {
    customConfig = require(customConfigPath);
  }

  return cleanupConfig(
    customConfig?.(configs, {
      getInputFile,
      getPlugins,
      genOutput,
    }) ?? configs
  );
};

function cleanupConfig(configs) {
  return []
    .concat(configs)
    .map(({ input, output, plugins }) => ({ input, output, plugins }));
}

function genBaseConfig({ env, moduleName = packageName() }) {
  return {
    env,
    input: getInputFile(moduleName),
    output: genOutput({ env }),
    plugins: getPlugins({ env }),
  };
}

function genOutput({
  format = opts.format.UMD,
  name = packageName(),
  env,
  flat = false,
} = {}) {
  const base = {
    exports: 'auto',
    name,
  };

  if (flat) {
    return outputByFormat(format);
  }

  return [
    outputByFormat(opts.format.ES),
    outputByFormat(opts.format.UMD),
    outputByFormat(opts.format.CJS),
  ];

  function outputByFormat(format) {
    return {
      ...base,
      format: format ?? opts.format.UMD,
      file: vxPath.packageDist(
        packageName(),
        (!flat && format) || '',
        joinTruthy([name, env && env, 'js'], '.')
      ),
    };
  }
}

function getInputFile(moduleName = packageName()) {
  const base = vxPath.packageSrc(packageName(), moduleName + '.ts');
  return fs.existsSync(base)
    ? base
    : vxPath.packageSrc(packageName(), 'index.ts');
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
    plugins.push(compiler(), terser());
  }

  return plugins;
}

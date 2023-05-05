// const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const replace = require('@rollup/plugin-replace');
const _ = require('lodash');
const { terser } = require('rollup-plugin-terser');
const ts = require('rollup-plugin-ts');

const { disallowExternals } = require('./format');
const addCJSPackageJson = require('./plugins/addCJSPackageJson');
const addModulePackageJson = require('./plugins/addModulePackageJson');
const handleExports = require('./plugins/handleExports');

const opts = require('vx/opts');
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

module.exports = function getPlugins({
  env = opts.env.PRODUCTION,
  packageName = usePackage(),
  moduleName = packageName,
  namespace = undefined,
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
      browserList: env === opts.env.PRODUCTION ? ['IE10'] : [],
      hook: {
        outputPath: (path, kind) => {
          const basePath = vxPath.package(
            packageName,
            opts.dir.TYPES,
            namespace,
            moduleName + '.d.ts'
          );

          if (kind === 'declaration') return basePath;
          if (kind === 'declarationMap') return basePath + '.map';
        },
      },
      transpileOnly: env !== opts.env.PRODUCTION,
      tsconfig: {
        fileName: vxPath.packageTsConfig(packageName),
        // eslint-disable-next-line complexity
        hook: resolvedConfig => {
          resolvedConfig.rootDir = vxPath.package(packageName);

          if (disallowExternals) {
            return resolvedConfig;
          }
          const clonedConfig = _.cloneDeep(resolvedConfig);

          // The changes made in this function allow using the already installed
          // module instead of embedding of the code.

          if (packageName === moduleName) {
            return clonedConfig;
          }

          // Removes current package from the paths list if in an "exported" module
          delete clonedConfig.paths[packageName];
          return clonedConfig;
        },
      },
    }),
  ];

  if (env === opts.env.PRODUCTION) {
    plugins.push(
      // compiler(),
      terser(),
      handleExports({ namespace }),
      addModulePackageJson(),
      addCJSPackageJson()
    );
  }

  return plugins;
};

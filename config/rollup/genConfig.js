const path = require('path');

const { packageJson, packagePath } = require('../../util');
const getPlugins = require('./getPlugins');
const nameByFormat = require('./nameByFormat');

const ENV_DEVELOPMENT = 'development';
const ENV_PRODUCTION = 'production';

const FORMAT_UMD = 'umd';
const FORMAT_CJS = 'cjs';
const FORMAT_ES = 'es';
const DIR_ESM = 'esm';

module.exports = function genConfig({
  distPath,
  libraryName,
  packageName = libraryName,
  input = 'index.js',
  esInput = input,
} = {}) {
  return [
    {
      distPath,
      format: FORMAT_ES,
      input: esInput,
      libraryName,
      outputDir: DIR_ESM,
      packageName,
    },
    { distPath, format: FORMAT_UMD, input, libraryName, packageName },
    { distPath, format: FORMAT_CJS, input, libraryName, packageName },
  ]
    .reduce(
      (configs, current) =>
        configs.concat(
          { ...current },
          { ...current, dev: true },
          { ...current, min: true }
        ),
      []
    )
    .map(buildConfig);
};

function buildConfig({
  format,
  dev = false,
  min = false,
  outputDir = '',
  distPath,
  libraryName,
  input,
  packageName,
} = {}) {
  const { version } = packageJson(packageName);
  const PACKAGE_PATH = packagePath(packageName);
  const SRC_PATH = path.join(PACKAGE_PATH, 'src');

  return {
    input: path.join(SRC_PATH, input),
    output: {
      file: [
        path.join(distPath, outputDir, libraryName),
        nameByFormat(format),
        dev ? ENV_DEVELOPMENT : ENV_PRODUCTION,
        min ? 'min' : null,
        'js',
      ]
        .filter(Boolean)
        .join('.'),
      format: format || FORMAT_UMD,
      name: libraryName,
      ...(format === FORMAT_CJS && {
        exports: 'default',
      }),
    },
    plugins: getPlugins({
      dev,
      format,
      libraryName,
      min,
      version,
    }),
  };
}

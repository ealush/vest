const path = require('path');

const { packageJson, packagePath, envNames } = require('../../util');

const getPlugins = require('./getPlugins');
const nameByFormat = require('./nameByFormat');

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
    { distPath, format: FORMAT_UMD, input, libraryName, packageName },
    {
      distPath,
      format: FORMAT_ES,
      input: esInput,
      libraryName,
      outputDir: DIR_ESM,
      packageName,
    },
    { distPath, format: FORMAT_CJS, input, libraryName, packageName },
  ]
    .reduce(
      (configs, current) =>
        configs.concat(
          { ...current, min: true },
          { ...current },
          { ...current, dev: true }
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

  return {
    input: packagePath(packageName, 'src', input),
    output: {
      file: [
        path.join(distPath, outputDir, libraryName),
        nameByFormat(format),
        dev ? envNames.DEVELOPMENT : envNames.PRODUCTION,
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

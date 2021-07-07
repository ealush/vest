// This eventually produces a valid rollup configuration that extends the base config

module.exports = (baseConfig, { getInputFile, getPlugins, genOutput } = {}) => {
  return baseConfig.concat(
    {
      input: getInputFile('utilities/promisify'),
      plugins: getPlugins({ moduleName: 'promisify' }),
      output: genOutput({ flat: true, name: 'promisify' }),
    },
    {
      input: getInputFile('utilities/classnames'),
      plugins: getPlugins({ moduleName: 'classnames' }),
      output: genOutput({ flat: true, name: 'classnames' }),
    }
  );
};

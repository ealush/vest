// This eventually produces a valid rollup configuration that extends the base config

module.exports = ({ getInputFile, getPlugins, genOutput } = {}) => {
  return [
    {
      input: getInputFile('utilities/promisify'),
      plugins: getPlugins({ moduleName: 'promisify' }),
      output: genOutput({ name: 'promisify' }),
    },
    {
      input: getInputFile('utilities/classnames'),
      plugins: getPlugins({ moduleName: 'classnames' }),
      output: genOutput({ name: 'classnames' }),
    },
  ];
};

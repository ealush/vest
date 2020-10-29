const path = require('path');

const { moduleAliases, filePaths } = require('../../util');

const moduleNameMapper = moduleAliases.reduce(
  (aliases, { name, absolute }) =>
    Object.assign(aliases, { [`^${name}$`]: absolute }),
  {}
);

module.exports = (options = {}) => ({
  clearMocks: true,
  moduleNameMapper,
  rootDir: '.',
  roots: ['<rootDir>'],
  setupFilesAfterEnv: [path.join(filePaths.CONFIG_PATH, 'jest/jest.setup.js')],
  testEnvironment: 'node',
  testMatch: ['**/*.(spec|test).js'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: filePaths.BABEL_CONFIG_PATH }],
  },
  ...options,
});

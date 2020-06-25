const path = require('path');
const { BABEL_CONFIG_PATH, CONFIG_PATH } = require('..');

module.exports = (options = {}) => ({
  clearMocks: true,
  rootDir: '.',
  roots: ['<rootDir>'],
  setupFilesAfterEnv: [path.join(CONFIG_PATH, 'jest/jest.setup.js')],
  testEnvironment: 'node',
  testMatch: ['**/*/(spec|test).js', '**/*.(spec|test).js'],
  transform: {
    '\\.(j|t)s$': ['babel-jest', { configFile: BABEL_CONFIG_PATH }],
  },
  ...options,
});

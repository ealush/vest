const path = require('path');
const { BABEL_CONFIG_PATH, CONFIG_PATH } = require('..');

module.exports = {
  clearMocks: true,
  rootDir: '../../',
  roots: ['<rootDir>'],
  setupFiles: [path.join(CONFIG_PATH, 'jest/jest.setup.js')],
  testEnvironment: 'node',
  testMatch: ['**/*/(spec|test).js', '**/*.(spec|test).js'],
  transform: {
    '\\.js$': ['babel-jest', { configFile: BABEL_CONFIG_PATH }],
  },
};

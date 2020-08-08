const path = require('path');
const { PACKAGE_VEST } = require('../../../../../shared/constants');
const { exec, packageJson } = require('../../../../../util');

const { main } = packageJson(PACKAGE_VEST);

const mainExport = path.basename(main);
const scriptPath = path.join(__dirname, 'scripts');

const execSilent = cmd => exec(cmd, { silent: true, throwOnFailure: true });

describe('Test Vest Exports', () => {
  beforeAll(() => {
    execSilent(`sh ${scriptPath}/prepare.sh`);
  });

  afterAll(() => {
    execSilent(`sh ${scriptPath}/cleanup.sh`);
  });

  describe('When imported as module', () => {
    it('Should run mjs correctly', () => {
      execSilent(`sh ${scriptPath}/as_import.sh module`);
    });

    it('Should fail when expecting cjs', () => {
      expect(() =>
        execSilent(`sh ${scriptPath}/as_import.sh commonjs`)
      ).toThrow();
    });
  });

  describe('When required as cjs', () => {
    it('Should run cjs correctly', () => {
      execSilent(`sh ${scriptPath}/as_require.sh commonjs`);
    });

    it('Should fail when expecting esm', () => {
      expect(() =>
        execSilent(`sh ${scriptPath}/as_require.sh module`)
      ).toThrow();
    });
  });

  describe('When imported main export', () => {
    it('Should fail when trying to use named exports', () => {
      expect(() =>
        execSilent(`sh ${scriptPath}/custom_import.sh module ${mainExport}`)
      ).toThrow();
    });

    it('Should run required umd correctly', () => {
      execSilent(`sh ${scriptPath}/custom_require.sh commonjs ${mainExport}`);
    });
  });
});

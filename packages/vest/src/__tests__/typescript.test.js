const { execSync } = require('child_process');
const path = require('path');

const glob = require('glob');

const packagePath = require('../../../../util/packagePath');

describe('Declarations', () => {
  const declarationFiles = glob
    .sync('src/typings/*.d.ts', {
      cwd: packagePath('vest'),
      absolute: true,
      ignore: '**/spec/*',
    })
    .join(' ');

  it(`Should pass tsc validation`, () => {
    expect(() => {
      execSync(`node_modules/.bin/tsc ${declarationFiles}`);
    }).not.toThrow();
  });

  it('Should fail Typescript check with failing file', () => {
    expect(() => {
      execSync(
        `node_modules/.bin/tsc ${packagePath(
          'vest/src/spec/failing.d.ts',
          'vest.d.ts'
        )}`
      );
    }).toThrow();
  });
});

const files = glob
  .sync('./types/*.ts', {
    absolute: true,
    cwd: __dirname,
  })
  .map(f => [path.basename(f), f]);

describe('Usage', () => {
  // Running this test requires an up-to-date local build
  it.each(files)('Should run file correctly (%s)', (file, path) => {
    execSync(`node_modules/.bin/tsc --esModuleInterop	true --noEmit ${path}`, {
      stdio: 'inherit',
    });
  });
});

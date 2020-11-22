const { execSync } = require('child_process');
const path = require('path');

const glob = require('glob');

const {
  packagePath,
  packageSrc,
  packageNames,
} = require('../../../../../util');

describe('Declarations', () => {
  const declarationFiles = glob
    .sync('./*.d.ts', {
      cwd: packageSrc(packageNames.VEST, 'typings'),
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
        `node_modules/.bin/tsc ${path.join(
          __dirname,
          'fixtures',
          'failing.d.ts'
        )}`
      );
    }).toThrow();
  });
});

const files = glob
  .sync('./fixtures/*.ts', {
    absolute: true,
    cwd: __dirname,
    ignore: ['./fixtures/*.d.ts'],
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

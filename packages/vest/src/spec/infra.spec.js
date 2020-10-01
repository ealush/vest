const { execSync } = require('child_process');
const glob = require('glob');
const vest = require('..');
const packagePath = require('../../../../util/packagePath');
const { version } = require('../../package.json');

describe('Vest exports', () => {
  test('All vest exports exist', () => {
    expect(vest).toMatchSnapshot({
      VERSION: expect.any(String),
    });
    expect(vest.VERSION).toBe(version);
  });
});

describe('General scenario tests', () => {
  let v, test, create, enforce;

  beforeAll(() => {
    ({ test, create, enforce } = vest);
  });

  describe('Base case', () => {
    it('Should match snapshot', () => {
      v = create('eveniet-maxime-ea', () => {
        test(
          'sed-minima-adipisci',
          'Aliquam reprehenderit iure omnis assumenda eligendi enim id praesentium numquam.',
          () => {
            enforce(1).equals(2);
          }
        );

        test('non-rem-dolorem', () => {
          enforce(1).inside([1, 2, 3]);
        });
      });
      expect(v()).toMatchSnapshot();
    });
  });

  describe('Exclusion via `only`', () => {
    it('Should match snapshot', () => {
      v = create('inventore-quis-impedit', () => {
        vest.only('doloribus-enim-quisquam');

        test(
          'doloribus-enim-quisquam',
          'Ea quia saepe modi corrupti possimus similique expedita inventore.',
          () => {
            enforce(1).notEquals(2);
          }
        );

        test('autem', () => null);
        test('soluta', () => null);
      });
      expect(v()).toMatchSnapshot();
    });
  });

  describe('Exclusion via `skip`', () => {
    it('Should match snapshot', () => {
      v = create('corrupti-alias-autem', () => {
        vest.skip('doloribus-enim-quisquam');

        test(
          'doloribus-enim-quisquam',
          'Ea quia saepe modi corrupti possimus similique expedita inventore.',
          () => {
            enforce(1).notEquals(2);
          }
        );

        test('autem', 'Temporibus ex ex.', () => {
          vest.warn();
          return 1 === 2;
        });
      });
      expect(v()).toMatchSnapshot();
    });
  });

  describe('Tests with warnings', () => {
    it('Should match snapshot', () => {
      v = create('corrupti-alias-autem', () => {
        vest.skip('doloribus-enim-quisquam');

        test(
          'doloribus-enim-quisquam',
          'Ea quia saepe modi corrupti possimus similique expedita inventore.',
          () => {
            enforce(1).notEquals(2);
          }
        );

        test('autem', 'Temporibus ex ex.', () => {
          vest.warn();
          return 1 === 2;
        });
        test('autem', () => {
          vest.warn();
          enforce(1).gt(0);
        });
      });
      expect(v()).toMatchSnapshot();
    });
  });

  describe('Async tests', () => {
    it('Should match snapshot', () =>
      new Promise(done => {
        v = create('molestias-veritatis-deserunt', () => {
          test(
            'doloribus-enim-quisquam',
            'Fuga odit ut quidem autem dolores ipsam.',
            () => Promise.resolve()
          );
          test(
            'doloribus-enim-quisquam',
            'Fuga odit ut quidem autem dolores ipsam.',
            () => Promise.reject()
          );
        });
        setTimeout(() => {
          expect(v()).toMatchSnapshot();
          done();
        });
      }));
  });
});

describe('TypeScript Typings', () => {
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

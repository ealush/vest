import faker from 'faker';
import _ from 'lodash';
import vest from '../..';
import { version } from '../../../package.json';
import mock from '../../../testUtils/mock';
import { ALL_VEST_BUILDS } from '../../../testUtils/vestBuilds';
import state from '../../core/state';
import go from '../globalObject';
import { SYMBOL_VEST_GLOBAL } from './constants';
import singleton from '.';

describe('singleton', () => {
  afterAll(() => {
    go.VEST_VERSION = vest.VERSION;
    singleton.register();
  });

  describe('Attaching to global scope', () => {
    beforeEach(() => {
      delete go[SYMBOL_VEST_GLOBAL];
    });

    afterEach(() => {
      delete go[SYMBOL_VEST_GLOBAL];
    });

    test('Santiy: That global instance is not populated yet', () => {
      expect(go[SYMBOL_VEST_GLOBAL]).toBeUndefined();
    });

    describe('When already registered', () => {
      describe('When same version', () => {
        it('Should return silently', () =>
          new Promise(done => {
            const timeout = setTimeout(() => done(), 300);

            process.on('uncaughtException', () => {
              clearTimeout(timeout);
            });
          }));
      });

      describe('When different version', () => {
        let singleton, mockThrowError;

        beforeEach(() => {
          mockThrowError = mock('throwError');
          singleton = require('.');
        });

        afterEach(() => {
          jest.resetAllMocks();
        });

        it('Should throw an error', () => {
          global.VEST_VERSION = '222';
          singleton.register();
          expect(mockThrowError.mock.calls[0][0]).toBe(
            `Multiple versions of Vest detected: (222,${version}).\n    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.`
          );
          global.VEST_VERSION = vest.VERSION;
        });
      });
    });
  });
});
describe('Integration: singleton', () => {
  beforeAll(() => {
    singleton.register();
    state.register();
  });

  const pairs = ALL_VEST_BUILDS.reduce(
    (pairs, { validate }) => [
      ...pairs,
      ...ALL_VEST_BUILDS.map(({ test }) => [validate, test]),
    ],
    []
  );

  it.each(pairs)(
    'Should produce correct validation result with `test` and `validate` from different builds',
    (validate, test) => {
      const errorCount = _.random(1, 10);
      const successCount = _.random(1, 10);
      const warnCount = _.random(1, 10);
      const output = validate(faker.random.word(), () => {
        Array.from({ length: warnCount }, () =>
          test(faker.random.word(), faker.lorem.sentence(), function () {
            this.warn();
            return false;
          })
        );
        Array.from({ length: errorCount }, () =>
          test(faker.random.word(), faker.lorem.sentence(), () => false)
        );
        Array.from({ length: successCount }, () =>
          test(faker.random.word(), faker.lorem.sentence(), () => true)
        );
      });

      expect(output.errorCount).toBe(errorCount);
      expect(output.warnCount).toBe(warnCount);
    }
  );
});

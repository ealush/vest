import { deferThrow } from 'vest-utils';
import { describe, it, expect, vi } from 'vitest';

import { TIsolateTest } from 'IsolateTest';
import * as vest from 'vest';

vi.mock('vest-utils', async () => {
  const vu = await vi.importActual('vest-utils');
  return {
    ...vu,
    deferThrow: vi.fn(),
  };
});

describe('key', () => {
  describe('When key is provided', () => {
    describe('When tests change their order between runs', () => {
      it('Should retain test results', () => {
        let count = 0;
        const suite = vest.create(() => {
          /**
           * This test is pretty confusing, but its the most effective way to test this behavior.
           *
           * It basically checks that when provided, key is used to override default test order behavior.
           * We don't mind the order of tests, because the key tells us which test really needs to get which state.
           *
           * The reason we have both skipWhen and and if block is this:
           * if/else: to simulate reordering between runs
           * skipWhen: to prevent running the tests so they have to get the previous state
           */

          vest.skipWhen(count === 1, () => {
            if (count === 0) {
              vest.test('field_1', () => false, 'field_1_key_1');
              vest.test('field_1', () => undefined, 'field_1_key_2');
              vest.test('field_2', () => false, 'field_2_key_1');
              vest.test('field_2', () => undefined, 'field_2_key_2');
            } else {
              vest.test('field_2', () => undefined, 'field_2_key_2');
              vest.test('field_2', () => false, 'field_2_key_1');
              vest.test('field_1', () => undefined, 'field_1_key_2');
              vest.test('field_1', () => false, 'field_1_key_1');
            }
          });
          count++;
        });

        const res1 = suite();
        const res2 = suite();

        expect(res1.tests).toEqual(res2.tests);
      });
    });

    describe('When two tests in two different isolates have the same key', () => {
      it('Should regarad each key as unique and retain each tests individual result', () => {
        const calls: TIsolateTest[][] = [];
        const suite = vest.create(() => {
          const currentCall: TIsolateTest[] = [];

          vest.skipWhen(calls.length === 1, () => {
            vest.group('group_1', () => {
              currentCall.push(vest.test('field1', () => false, 'key_1'));
            });

            vest.group('group_2', () => {
              currentCall.push(vest.test('field2', () => false, 'key_1'));
            });
          });

          calls.push(currentCall);
        });

        const res1 = suite();
        const res2 = suite();

        expect(calls[0][0]).toBe(calls[1][0]);
        expect(calls[0][1]).toBe(calls[1][1]);
        expect(calls[0][0]).not.toBe(calls[0][1]);
        expect(calls[1][0]).not.toBe(calls[1][1]);
        expect(res1.tests).toEqual(res2.tests);
      });
    });

    describe('When tests without a key reorder get added above a test with a key', () => {
      it('Should retain keyd tests', () => {
        const calls: TIsolateTest[][] = [];
        const suite = vest.create(() => {
          const currentCall: TIsolateTest[] = [];
          vest.skipWhen(calls.length === 1, () => {
            if (calls.length === 1) {
              vest.test('reordered', () => false);
            }

            currentCall.push(vest.test('field1', () => false, 'key_1'));
            currentCall.push(vest.test('field2', () => false, 'key_2'));
            currentCall.push(vest.test('field3', () => false, 'key_3'));

            if (calls.length === 0) {
              vest.test('reordered', () => false);
            }
          });
          calls.push(currentCall);
        });

        const res1 = suite();
        const res2 = suite();

        expect(deferThrow).toHaveBeenCalled();

        expect(calls[0][0]).toBe(calls[1][0]);
        expect(calls[0][1]).toBe(calls[1][1]);
        expect(calls[0][2]).toBe(calls[1][2]);
        expect(res1.tests.reordered).toMatchInlineSnapshot(
          {
            errorCount: 1,
            errors: [],
            pendingCount: 0,
            testCount: 1,
            valid: false,
            warnCount: 0,
            warnings: [],
          },
          `
          {
            "errorCount": 1,
            "errors": [],
            "pendingCount": 0,
            "testCount": 1,
            "valid": false,
            "warnCount": 0,
            "warnings": [],
          }
        `,
        );
        expect(res2.tests.reordered).toMatchInlineSnapshot(
          {
            errorCount: 0,
            errors: [],
            testCount: 0,
            valid: false,
            warnCount: 0,
            warnings: [],
          },
          `
          {
            "errorCount": 0,
            "errors": [],
            "pendingCount": 0,
            "testCount": 0,
            "valid": false,
            "warnCount": 0,
            "warnings": [],
          }
        `,
        );
        expect(res1.tests).not.toEqual(res2.tests);
        expect(res2.tests).toMatchInlineSnapshot(`
          {
            "field1": SummaryBase {
              "errorCount": 1,
              "errors": [],
              "pendingCount": 0,
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
            "field2": SummaryBase {
              "errorCount": 1,
              "errors": [],
              "pendingCount": 0,
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
            "field3": SummaryBase {
              "errorCount": 1,
              "errors": [],
              "pendingCount": 0,
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
            "reordered": SummaryBase {
              "errorCount": 0,
              "errors": [],
              "pendingCount": 0,
              "testCount": 0,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
          }
        `);
      });
    });

    describe('When the same key is encountered twice', () => {
      it('Should throw a deferred error', async () => {
        const suite = vest.create(() => {
          vest.test('field1', () => false, 'key_1');
          vest.test('field2', () => false, 'key_1');
        });

        suite();
        expect(deferThrow).toHaveBeenCalledWith(
          `Encountered the same key "key_1" twice. This may lead to inconsistent or overriding of results.`,
        );
      });
    });
  });

  describe('Special combinations', () => {
    describe('Key with only', () => {
      it('Should return or revoke previous test result normally', () => {
        const suite = vest.create((data, fields?: string[]) => {
          vest.only(fields);
          vest.test(
            'test_a',
            'Enter a value',
            () => {
              vest.enforce(data.a).isNotEmpty();
            },
            'a',
          );
          vest.test(
            'test_b',
            'Enter a value',
            () => {
              vest.enforce(data.b).isNotEmpty();
            },
            'b',
          );
        });

        suite({ a: '', b: '' }).done(() => {
          expect(suite.hasErrors('test_a')).toBe(true);
          expect(suite.hasErrors('test_b')).toBe(true);
        });
        suite({ a: 's', b: '' }, ['test_a']).done(() => {
          expect(suite.hasErrors('test_a')).toBe(false);
          expect(suite.hasErrors('test_b')).toBe(true);
        });
        suite({ a: 's', b: 's' }, ['test_b']).done(() => {
          expect(suite.hasErrors('test_a')).toBe(false);
          expect(suite.hasErrors('test_b')).toBe(false);
        });
      });
    });
    describe('Key with omitWhen', () => {
      it('Should return or revoke previous test result normally', () => {
        const suite = vest.create((data, omit: boolean) => {
          vest.omitWhen(omit, () => {
            vest.test(
              'test_a',
              'Enter a value',
              () => {
                vest.enforce(data.a).isNotEmpty();
              },
              'a',
            );
          });
        });

        suite({ a: '' }, false).done(() => {
          expect(suite.hasErrors('test_a')).toBe(true);
        });
        suite({ a: '' }, false).done(() => {
          expect(suite.hasErrors('test_a')).toBe(true);
        });
        suite({ a: 's' }, true).done(() => {
          expect(suite.hasErrors('test_a')).toBe(false);
        });
      });
    });
  });
});

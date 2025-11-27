import { deferThrow } from 'vest-utils';
import { describe, it, expect, vi } from 'vitest';

import { TFieldName } from '../../suiteResult/SuiteResultTypes';
import * as vest from '../../vest';

vi.mock('vest-utils', async () => {
  const vu = await vi.importActual('vest-utils');
  return {
    ...vu,
    deferThrow: vi.fn(),
  };
});

describe('each', () => {
  describe('when callback is not a function', () => {
    it('should throw an error', () => {
      const control = vi.fn();
      const suite = vest.create(() => {
        expect(() => {
          // @ts-expect-error
          vest.each([null], null);
        }).toThrowErrorMatchingSnapshot();
        control();
      });

      suite.run();
      expect(control).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass the current list item and index to the callback', () => {
    const cb = vi.fn();
    const suite = vest.create(() => {
      vest.each([1, 2, 3, 'str'], cb);
    });

    suite.run();

    expect(cb).toHaveBeenCalledTimes(4);

    expect(cb).toHaveBeenNthCalledWith(1, 1, 0);
    expect(cb).toHaveBeenNthCalledWith(2, 2, 1);
    expect(cb).toHaveBeenNthCalledWith(3, 3, 2);
    expect(cb).toHaveBeenNthCalledWith(4, 'str', 3);
  });

  describe('test reorder', () => {
    it('should allow reordering within each()', () => {
      const suite = vest.create(() => {
        vest.each([0, 1], v => {
          vest.test((v === 0 ? 'a' : 'b') as TFieldName, 'test', () => false);
        });
      });

      suite.run();

      expect(() => suite.run()).not.toThrow();
    });

    describe('sanity', () => {
      it('should disallow reordering outside of each()', () => {
        let firstRun = true;
        const suite = vest.create(() => {
          if (firstRun) {
            vest.test('a' as TFieldName, 'test', () => false);
          } else {
            vest.test('b' as TFieldName, 'test', () => false);
          }
          firstRun = false;
        });

        suite.run();
        suite.run();
        expect(deferThrow).toHaveBeenCalled();
      });
    });
  });

  it('should retain failed/passing tests even after skipping runs', () => {
    const suite = vest.create((data: number[], only: number) => {
      vest.only(`item.${only}` as TFieldName);

      vest.each(data, item => {
        vest.test(
          `item.${item}` as TFieldName,
          () => {
            vest.enforce(item).isOdd();
          },
          item.toString(),
        );
      });
    });
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    data.forEach((_, idx) => suite.run(data, idx + 1));
    expect(suite.get().errors).toHaveLength(5);
    expect(suite.hasErrors('item.1' as TFieldName)).toBe(false);
    expect(suite.hasErrors('item.2' as TFieldName)).toBe(true);
    expect(suite.hasErrors('item.3' as TFieldName)).toBe(false);
    expect(suite.hasErrors('item.4' as TFieldName)).toBe(true);
    expect(suite.hasErrors('item.5' as TFieldName)).toBe(false);
    expect(suite.hasErrors('item.6' as TFieldName)).toBe(true);
    expect(suite.hasErrors('item.7' as TFieldName)).toBe(false);
    expect(suite.hasErrors('item.8' as TFieldName)).toBe(true);
    expect(suite.hasErrors('item.9' as TFieldName)).toBe(false);
    expect(suite.hasErrors('item.10' as TFieldName)).toBe(true);
  });
});

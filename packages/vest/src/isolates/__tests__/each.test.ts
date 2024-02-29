import { TDeferThrow } from 'vest-utils/src/deferThrow';

import { TVestMock } from '../../testUtils/TVestMock';
import mockThrowError from '../../testUtils/mockThrowError';

import * as vest from 'vest';

describe('each', () => {
  describe('When callback is not a function', () => {
    it('should throw', () => {
      const control = jest.fn();
      const suite = vest.create(() => {
        expect(() => {
          // @ts-expect-error
          vest.each([null], null);
        }).toThrowErrorMatchingSnapshot();
        control();
      });

      suite();
      expect(control).toHaveBeenCalledTimes(1);
    });
  });

  it('Should pass to callback the current list item and index', () => {
    const cb = jest.fn();
    const suite = vest.create(() => {
      vest.each([1, 2, 3, 'str'], cb);
    });

    suite();

    expect(cb).toHaveBeenCalledTimes(4);

    expect(cb).toHaveBeenNthCalledWith(1, 1, 0);
    expect(cb).toHaveBeenNthCalledWith(2, 2, 1);
    expect(cb).toHaveBeenNthCalledWith(3, 3, 2);
    expect(cb).toHaveBeenNthCalledWith(4, 'str', 3);
  });

  describe('Test Reorder', () => {
    let deferThrow: TDeferThrow;
    let vest: TVestMock;

    beforeEach(() => {
      const mock = mockThrowError();
      deferThrow = mock.deferThrow;

      vest = mock.vest;
    });

    it('Should allow reorder', () => {
      const suite = vest.create(() => {
        vest.each([0, 1], v => {
          vest.test(v === 0 ? 'a' : 'b', 'test', () => false);
        });
      });

      suite();
      suite();

      expect(deferThrow).toHaveBeenCalledTimes(0);
    });

    describe('Sanity', () => {
      it('Should disallow reorder outside of each', () => {
        let firstRun = true;
        const suite = vest.create(() => {
          if (firstRun) {
            vest.test('a', 'test', () => false);
          } else {
            vest.test('b', 'test', () => false);
          }
          firstRun = false;
        });

        suite();
        suite();

        expect(deferThrow).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Should retain failed/passing tests even after skipping', () => {
    let run = 0;
    const suite = vest.create((data: number[], only: number) => {
      vest.only(`item.${only}`);

      vest.each(data, item => {
        vest.test(
          `item.${item}`,
          () => {
            vest.enforce(item).isOdd();
          },
          item.toString(),
        );
      });
      run++;
    });
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    data.forEach((_, idx) => suite(data, idx + 1));
    expect(suite.get().errors).toHaveLength(5);
    expect(suite.hasErrors('item.1')).toBe(false);
    expect(suite.hasErrors('item.2')).toBe(true);
    expect(suite.hasErrors('item.3')).toBe(false);
    expect(suite.hasErrors('item.4')).toBe(true);
    expect(suite.hasErrors('item.5')).toBe(false);
    expect(suite.hasErrors('item.6')).toBe(true);
    expect(suite.hasErrors('item.7')).toBe(false);
    expect(suite.hasErrors('item.8')).toBe(true);
    expect(suite.hasErrors('item.9')).toBe(false);
    expect(suite.hasErrors('item.10')).toBe(true);
  });
});

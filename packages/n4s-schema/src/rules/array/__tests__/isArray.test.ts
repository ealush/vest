import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isArray', () => {
  it('pass for empty arrays', () => {
    expect(enforceLazy.isArray<any>().run([]).pass).toBe(true);
  });

  it('pass for arrays with elements', () => {
    expect(enforceLazy.isArray<number>().run([1, 2]).pass).toBe(true);
    expect(enforceLazy.isArray<string>().run(['a', 'b']).pass).toBe(true);
    expect(enforceLazy.isArray<any>().run([null, undefined]).pass).toBe(true);
    expect(enforceLazy.isArray<any>().run([{}, []]).pass).toBe(true);
  });

  it('fails for array-like objects', () => {
    const arrayLike: any = { 0: 'a', 1: 'b', length: 2 };
    expect(enforceLazy.isArray<any>().run(arrayLike).pass).toBe(false);
  });

  it('fails for non-arrays', () => {
    const values: any[] = [{}, null, undefined, 0, '', true, 'text', () => {}];

    values.forEach(value => {
      expect(enforceLazy.isArray<any>().run(value).pass).toBe(false);
    });
  });

  describe('chain: minLength', () => {
    it('pass when length meets minimum', () => {
      expect(enforceLazy.isArray<number>().minLength(1).run([1]).pass).toBe(
        true,
      );
      expect(enforceLazy.isArray<number>().minLength(1).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforceLazy.isArray<number>().minLength(0).run([]).pass).toBe(
        true,
      );
    });

    it('fails when length is below minimum', () => {
      expect(enforceLazy.isArray<number>().minLength(1).run([]).pass).toBe(
        false,
      );
      expect(enforceLazy.isArray<number>().minLength(3).run([1, 2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: maxLength', () => {
    it('pass when length is within maximum', () => {
      expect(enforceLazy.isArray<number>().maxLength(2).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforceLazy.isArray<number>().maxLength(2).run([1]).pass).toBe(
        true,
      );
      expect(enforceLazy.isArray<number>().maxLength(0).run([]).pass).toBe(
        true,
      );
    });

    it('fails when length exceeds maximum', () => {
      expect(enforceLazy.isArray<number>().maxLength(1).run([1, 2]).pass).toBe(
        false,
      );
      expect(enforceLazy.isArray<number>().maxLength(0).run([1]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: lengthEquals', () => {
    it('pass when length matches exactly', () => {
      expect(
        enforceLazy.isArray<number>().lengthEquals(2).run([1, 2]).pass,
      ).toBe(true);
      expect(enforceLazy.isArray<number>().lengthEquals(0).run([]).pass).toBe(
        true,
      );
    });

    it('fails when length differs', () => {
      expect(enforceLazy.isArray<number>().lengthEquals(1).run([]).pass).toBe(
        false,
      );
      expect(
        enforceLazy.isArray<number>().lengthEquals(1).run([1, 2]).pass,
      ).toBe(false);
    });
  });

  describe('chain: lengthNotEquals', () => {
    it('pass when length differs', () => {
      expect(
        enforceLazy.isArray<number>().lengthNotEquals(0).run([1]).pass,
      ).toBe(true);
      expect(
        enforceLazy.isArray<number>().lengthNotEquals(1).run([]).pass,
      ).toBe(true);
    });

    it('fails when length matches', () => {
      expect(
        enforceLazy.isArray<number>().lengthNotEquals(0).run([]).pass,
      ).toBe(false);
      expect(
        enforceLazy.isArray<number>().lengthNotEquals(2).run([1, 2]).pass,
      ).toBe(false);
    });
  });

  describe('chain: includes', () => {
    it('pass when item is in array', () => {
      expect(enforceLazy.isArray<number>().includes(2).run([1, 2]).pass).toBe(
        true,
      );
      expect(
        enforceLazy.isArray<string>().includes('a').run(['a', 'b']).pass,
      ).toBe(true);
    });

    it('fails when item is not in array', () => {
      expect(enforceLazy.isArray<number>().includes(3).run([1, 2]).pass).toBe(
        false,
      );
      expect(
        enforceLazy.isArray<string>().includes('c').run(['a', 'b']).pass,
      ).toBe(false);
    });
  });

  describe('chain: inside', () => {
    it('pass when all items are in container', () => {
      expect(
        enforceLazy.isArray<number>().inside([1, 2, 3]).run([1, 2]).pass,
      ).toBe(true);
      expect(enforceLazy.isArray<number>().inside([5]).run([]).pass).toBe(true);
    });

    it('fails when some items are not in container', () => {
      expect(
        enforceLazy.isArray<number>().inside([1, 2]).run([1, 2, 3]).pass,
      ).toBe(false);
      expect(enforceLazy.isArray<number>().inside([1]).run([2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: notInside', () => {
    it('pass when some items are not in container', () => {
      expect(
        enforceLazy.isArray<number>().notInside([3, 4]).run([1, 2]).pass,
      ).toBe(true);
      expect(
        enforceLazy.isArray<number>().notInside([1]).run([2, 3]).pass,
      ).toBe(true);
    });

    it('fails when all items are in container', () => {
      expect(
        enforceLazy.isArray<number>().notInside([1, 2, 3]).run([1, 2]).pass,
      ).toBe(false);
    });
  });

  describe('chain: isEmpty', () => {
    it('pass for empty arrays', () => {
      expect(enforceLazy.isArray<number>().isEmpty().run([]).pass).toBe(true);
    });

    it('fails for non-empty arrays', () => {
      expect(enforceLazy.isArray<number>().isEmpty().run([1]).pass).toBe(false);
    });
  });

  describe('chain: isNotEmpty', () => {
    it('pass for non-empty arrays', () => {
      expect(enforceLazy.isArray<number>().isNotEmpty().run([1]).pass).toBe(
        true,
      );
    });

    it('fails for empty arrays', () => {
      expect(enforceLazy.isArray<number>().isNotEmpty().run([]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: equals', () => {
    it('pass when arrays are the same reference', () => {
      const arr = [1, 2, 3];
      expect(enforceLazy.isArray<number>().equals(arr).run(arr).pass).toBe(
        true,
      );
    });

    it('fails when arrays have same content but different references', () => {
      expect(
        enforceLazy.isArray<number>().equals([1, 2]).run([1, 2]).pass,
      ).toBe(false);
    });
  });

  describe('chain: longerThan', () => {
    it('pass when array length is greater', () => {
      expect(enforceLazy.isArray<number>().longerThan(1).run([1, 2]).pass).toBe(
        true,
      );
    });

    it('fails when array length is equal or less', () => {
      expect(enforceLazy.isArray<number>().longerThan(2).run([1, 2]).pass).toBe(
        false,
      );
      expect(enforceLazy.isArray<number>().longerThan(3).run([1, 2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: shorterThan', () => {
    it('pass when array length is less', () => {
      expect(
        enforceLazy.isArray<number>().shorterThan(3).run([1, 2]).pass,
      ).toBe(true);
    });

    it('fails when array length is equal or greater', () => {
      expect(
        enforceLazy.isArray<number>().shorterThan(2).run([1, 2]).pass,
      ).toBe(false);
      expect(
        enforceLazy.isArray<number>().shorterThan(1).run([1, 2]).pass,
      ).toBe(false);
    });
  });
});

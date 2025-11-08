import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isArray', () => {
  it('pass for empty arrays', () => {
    expect(enforce.isArray<any>().run([]).pass).toBe(true);
  });

  it('pass for arrays with elements', () => {
    expect(enforce.isArray<number>().run([1, 2]).pass).toBe(true);
    expect(enforce.isArray<string>().run(['a', 'b']).pass).toBe(true);
    expect(enforce.isArray<any>().run([null, undefined]).pass).toBe(true);
    expect(enforce.isArray<any>().run([{}, []]).pass).toBe(true);
  });

  it('fails for array-like objects', () => {
    const arrayLike: any = { 0: 'a', 1: 'b', length: 2 };
    expect(enforce.isArray<any>().run(arrayLike).pass).toBe(false);
  });

  it('fails for non-arrays', () => {
    const values: any[] = [{}, null, undefined, 0, '', true, 'text', () => {}];

    values.forEach(value => {
      expect(enforce.isArray<any>().run(value).pass).toBe(false);
    });
  });

  describe('chain: minLength', () => {
    it('pass when length meets minimum', () => {
      expect(enforce.isArray<number>().minLength(1).run([1]).pass).toBe(true);
      expect(enforce.isArray<number>().minLength(1).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforce.isArray<number>().minLength(0).run([]).pass).toBe(true);
    });

    it('fails when length is below minimum', () => {
      expect(enforce.isArray<number>().minLength(1).run([]).pass).toBe(false);
      expect(enforce.isArray<number>().minLength(3).run([1, 2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: maxLength', () => {
    it('pass when length is within maximum', () => {
      expect(enforce.isArray<number>().maxLength(2).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforce.isArray<number>().maxLength(2).run([1]).pass).toBe(true);
      expect(enforce.isArray<number>().maxLength(0).run([]).pass).toBe(true);
    });

    it('fails when length exceeds maximum', () => {
      expect(enforce.isArray<number>().maxLength(1).run([1, 2]).pass).toBe(
        false,
      );
      expect(enforce.isArray<number>().maxLength(0).run([1]).pass).toBe(false);
    });
  });

  describe('chain: lengthEquals', () => {
    it('pass when length matches exactly', () => {
      expect(enforce.isArray<number>().lengthEquals(2).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforce.isArray<number>().lengthEquals(0).run([]).pass).toBe(true);
    });

    it('fails when length differs', () => {
      expect(enforce.isArray<number>().lengthEquals(1).run([]).pass).toBe(
        false,
      );
      expect(enforce.isArray<number>().lengthEquals(1).run([1, 2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: lengthNotEquals', () => {
    it('pass when length differs', () => {
      expect(enforce.isArray<number>().lengthNotEquals(0).run([1]).pass).toBe(
        true,
      );
      expect(enforce.isArray<number>().lengthNotEquals(1).run([]).pass).toBe(
        true,
      );
    });

    it('fails when length matches', () => {
      expect(enforce.isArray<number>().lengthNotEquals(0).run([]).pass).toBe(
        false,
      );
      expect(
        enforce.isArray<number>().lengthNotEquals(2).run([1, 2]).pass,
      ).toBe(false);
    });
  });

  describe('chain: includes', () => {
    it('pass when item is in array', () => {
      expect(enforce.isArray<number>().includes(2).run([1, 2]).pass).toBe(true);
      expect(enforce.isArray<string>().includes('a').run(['a', 'b']).pass).toBe(
        true,
      );
    });

    it('fails when item is not in array', () => {
      expect(enforce.isArray<number>().includes(3).run([1, 2]).pass).toBe(
        false,
      );
      expect(enforce.isArray<string>().includes('c').run(['a', 'b']).pass).toBe(
        false,
      );
    });
  });

  describe('chain: inside', () => {
    it('pass when all items are in container', () => {
      expect(enforce.isArray<number>().inside([1, 2, 3]).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforce.isArray<number>().inside([5]).run([]).pass).toBe(true);
    });

    it('fails when some items are not in container', () => {
      expect(enforce.isArray<number>().inside([1, 2]).run([1, 2, 3]).pass).toBe(
        false,
      );
      expect(enforce.isArray<number>().inside([1]).run([2]).pass).toBe(false);
    });
  });

  describe('chain: notInside', () => {
    it('pass when some items are not in container', () => {
      expect(enforce.isArray<number>().notInside([3, 4]).run([1, 2]).pass).toBe(
        true,
      );
      expect(enforce.isArray<number>().notInside([1]).run([2, 3]).pass).toBe(
        true,
      );
    });

    it('fails when all items are in container', () => {
      expect(
        enforce.isArray<number>().notInside([1, 2, 3]).run([1, 2]).pass,
      ).toBe(false);
    });
  });

  describe('chain: isEmpty', () => {
    it('pass for empty arrays', () => {
      expect(enforce.isArray<number>().isEmpty().run([]).pass).toBe(true);
    });

    it('fails for non-empty arrays', () => {
      expect(enforce.isArray<number>().isEmpty().run([1]).pass).toBe(false);
    });
  });

  describe('chain: isNotEmpty', () => {
    it('pass for non-empty arrays', () => {
      expect(enforce.isArray<number>().isNotEmpty().run([1]).pass).toBe(true);
    });

    it('fails for empty arrays', () => {
      expect(enforce.isArray<number>().isNotEmpty().run([]).pass).toBe(false);
    });
  });

  describe('chain: equals', () => {
    it('pass when arrays are the same reference', () => {
      const arr = [1, 2, 3];
      expect(enforce.isArray<number>().equals(arr).run(arr).pass).toBe(true);
    });

    it('fails when arrays have same content but different references', () => {
      expect(enforce.isArray<number>().equals([1, 2]).run([1, 2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: longerThan', () => {
    it('pass when array length is greater', () => {
      expect(enforce.isArray<number>().longerThan(1).run([1, 2]).pass).toBe(
        true,
      );
    });

    it('fails when array length is equal or less', () => {
      expect(enforce.isArray<number>().longerThan(2).run([1, 2]).pass).toBe(
        false,
      );
      expect(enforce.isArray<number>().longerThan(3).run([1, 2]).pass).toBe(
        false,
      );
    });
  });

  describe('chain: shorterThan', () => {
    it('pass when array length is less', () => {
      expect(enforce.isArray<number>().shorterThan(3).run([1, 2]).pass).toBe(
        true,
      );
    });

    it('fails when array length is equal or greater', () => {
      expect(enforce.isArray<number>().shorterThan(2).run([1, 2]).pass).toBe(
        false,
      );
      expect(enforce.isArray<number>().shorterThan(1).run([1, 2]).pass).toBe(
        false,
      );
    });
  });
});

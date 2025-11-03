import { enforce } from 'enforce';
import { describe, it, expect } from 'vitest';

// This suite validates the eager assertion API against the documented rules
// and mirrors behaviors covered by existing enforce tests in n4s (throw on fail,
// silent pass on success, and rich chaining across categories).

describe('eager enforce', () => {
  describe('basic behavior', () => {
    it('throws when a rule fails', () => {
      expect(() => enforce([]).isString()).toThrow();
      expect(() => enforce(1).greaterThan(1)).toThrow();
      expect(() => enforce(1).greaterThan(1).lessThan(0)).toThrow();
      expect(() => enforce('hi').matches(/[0-9]/)).toThrow();
    });

    it('returns silently when rule pass', () => {
      enforce(1).isNumber();
      enforce(1).greaterThan(0);
      enforce(1).greaterThan(0).lessThan(10);
      enforce('1984').matches(/[0-9]/);
    });

    it('includes a helpful failure message (rule name and value)', () => {
      expect(() => enforce('a').greaterThan('b')).toThrow(
        /enforce\/greaterThan failed with "a"/,
      );
      expect(() => enforce(['x']).shorterThan(0)).toThrow(
        /enforce\/shorterThan failed with \["x"\]/,
      );
    });
  });

  describe('custom messages with .message()', () => {
    it('throws custom message on rule failure', () => {
      expect(() =>
        enforce(1).message('Must be greater than 5').greaterThan(5),
      ).toThrow('Must be greater than 5');

      expect(() =>
        enforce('').message('Username is required').isNotEmpty(),
      ).toThrow('Username is required');
    });

    it('supports multiple .message() calls for different rules', () => {
      expect(() =>
        enforce('ab').message('Must be at least 3 characters').longerThan(2),
      ).toThrow('Must be at least 3 characters');

      // First rule pass, second fails with its message
      enforce('abc').message('Must be at least 3 characters').longerThan(2);

      expect(() =>
        enforce('abc')
          .message('Must be at least 3 characters')
          .longerThan(2)
          .message('Must be at most 5 characters')
          .shorterThan(3),
      ).toThrow('Must be at most 5 characters');
    });

    it('does not throw message when rule pass', () => {
      enforce(10).message('Should be greater').greaterThan(5);
      enforce('test').message('Should be string').isString();
    });
  });

  describe('equality', () => {
    it('equals / notEquals', () => {
      enforce(1).equals(1);
      enforce('hello').equals('hello');
      const a = [1, 2, 3];
      enforce(a).equals(a);

      expect(() => enforce('1').equals(1)).toThrow();
      expect(() => enforce([1, 2, 3]).equals([1, 2, 3])).toThrow();

      enforce('1').notEquals(1);
      enforce([1, 2, 3]).notEquals([1, 2, 3]);
      expect(() => enforce(a).notEquals(a)).toThrow();
      expect(() => enforce(1).notEquals(1)).toThrow();
    });
  });

  describe('emptiness - isEmpty / isNotEmpty', () => {
    it('isEmpty: arrays, strings, objects, primitives', () => {
      enforce([]).isEmpty();
      enforce('').isEmpty();
      enforce({}).isEmpty();
      enforce(0).isEmpty();
      enforce(NaN).isEmpty();
      enforce(undefined).isEmpty();
      enforce(null).isEmpty();
      enforce(false).isEmpty();

      expect(() => enforce([1]).isEmpty()).toThrow();
      expect(() => enforce('1').isEmpty()).toThrow();
      expect(() => enforce({ a: 1 }).isEmpty()).toThrow();
      expect(() => enforce(1).isEmpty()).toThrow();
      expect(() => enforce(true).isEmpty()).toThrow();
    });

    it('isNotEmpty', () => {
      enforce([1]).isNotEmpty();
      enforce('1').isNotEmpty();
      enforce({ a: 1 }).isNotEmpty();
      enforce(1).isNotEmpty();
      enforce(true).isNotEmpty();

      expect(() => enforce([]).isNotEmpty()).toThrow();
      expect(() => enforce('').isNotEmpty()).toThrow();
      expect(() => enforce({}).isNotEmpty()).toThrow();
      expect(() => enforce(0).isNotEmpty()).toThrow();
      expect(() => enforce(false).isNotEmpty()).toThrow();
    });
  });

  describe('numeric representation - isNumeric / isNotNumeric', () => {
    it('isNumeric: accepts numbers and numeric strings', () => {
      enforce(143).isNumeric();
      enforce('143').isNumeric();
      enforce(0).isNumeric();
      enforce('0').isNumeric();
      enforce(-5).isNumeric();
      enforce('-5').isNumeric();

      expect(() => enforce(NaN).isNumeric()).toThrow();
      expect(() => enforce('1hello').isNumeric()).toThrow();
      expect(() => enforce('hi').isNumeric()).toThrow();
      expect(() => enforce([]).isNumeric()).toThrow();
      expect(() => enforce({}).isNumeric()).toThrow();
    });

    it('isNotNumeric', () => {
      enforce(NaN).isNotNumeric();
      enforce('Hello World!').isNotNumeric();
      enforce([]).isNotNumeric();
      enforce({}).isNotNumeric();

      expect(() => enforce(731).isNotNumeric()).toThrow();
      expect(() => enforce('42').isNotNumeric()).toThrow();
      expect(() => enforce(0).isNotNumeric()).toThrow();
    });
  });

  it('number comparisons with coercion - greaterThan / greaterThanOrEquals', () => {
    // greaterThan
    enforce(1).greaterThan(0);
    enforce('10').greaterThan(0);
    enforce(900).greaterThan('100');

    expect(() => enforce(100).greaterThan(100)).toThrow();
    expect(() => enforce('100').greaterThan(110)).toThrow();
    expect(() => enforce([100] as any).greaterThan(1)).toThrow();

    // greaterThanOrEquals
    enforce(0).lessThan(1);
    enforce(2).lessThan('10');
    enforce('90').lessThan(100);

    expect(() => enforce(100).lessThan(100)).toThrow();
    enforce(900).greaterThanOrEquals('100');
    enforce(100).greaterThanOrEquals('100');
    enforce('1337').greaterThanOrEquals(1337);

    expect(() => enforce(100).greaterThanOrEquals('120')).toThrow();
    expect(() => enforce('100').greaterThanOrEquals(110)).toThrow();
    expect(() => enforce([100] as any).greaterThanOrEquals(1)).toThrow();
  });

  it('lessThan / lessThanOrEquals', () => {
    // lessThan
    enforce(0).lessThan(1);
    enforce(2).lessThan('10');
    enforce('90').lessThan(100);

    expect(() => enforce(100).lessThan(100)).toThrow();
    expect(() => enforce('110').lessThan(100)).toThrow();
    expect(() => enforce([0] as any).lessThan(1)).toThrow();

    // lessThanOrEquals
    enforce(0).lessThanOrEquals(1);
    enforce(2).lessThanOrEquals('10');
    enforce('90').lessThanOrEquals(100);
    enforce(100).lessThanOrEquals('100');

    expect(() => enforce(100).lessThanOrEquals(90)).toThrow();
    expect(() => enforce('110').lessThanOrEquals(100)).toThrow();
    expect(() => enforce([0] as any).lessThanOrEquals(1)).toThrow();
  });

  it('numberEquals / numberNotEquals', () => {
    // numberEquals - coerces strings to numbers
    enforce(0).numberEquals(0);
    enforce(2).numberEquals('2');
    enforce('100').numberEquals(100);

    expect(() => enforce(100).numberEquals(10)).toThrow();
    expect(() => enforce('110').numberEquals(100)).toThrow();
    expect(() => enforce([0] as any).numberEquals(1)).toThrow();

    // numberNotEquals
    enforce(2).numberNotEquals(0);
    enforce('11').numberNotEquals('10');
    enforce(100).numberNotEquals(99);

    expect(() => enforce(100).numberNotEquals(100)).toThrow();
    expect(() => enforce('110').numberNotEquals(110)).toThrow();
  });

  it('isBetween / isNotBetween', () => {
    // isBetween: inclusive on both ends
    enforce(5).isBetween(1, 10);
    enforce('5').isBetween(1, 10);
    enforce(1).isBetween(1, 10);
    enforce(10).isBetween(1, 10);

    expect(() => enforce(0).isBetween(1, 10)).toThrow();
    expect(() => enforce(11).isBetween(1, 10)).toThrow();

    // isNotBetween
    enforce(0).isNotBetween(1, 10);
    enforce(11).isNotBetween(1, 10);

    expect(() => enforce(5).isNotBetween(1, 10)).toThrow();
    expect(() => enforce(1).isNotBetween(1, 10)).toThrow();
  });

  it('parity - isEven / isOdd', () => {
    // isEven
    enforce(2).isEven();
    enforce(0).isEven();
    enforce(-4).isEven();

    expect(() => enforce(3).isEven()).toThrow();
    expect(() => enforce(1).isEven()).toThrow();

    // isOdd
    enforce(3).isOdd();
    enforce(1).isOdd();
    enforce(-3).isOdd();

    expect(() => enforce(2).isOdd()).toThrow();
    expect(() => enforce(0).isOdd()).toThrow();
  });

  it('sign - isPositive / isNegative', () => {
    // isPositive
    enforce(1).isPositive();
    enforce(100).isPositive();

    expect(() => enforce(0).isPositive()).toThrow();
    expect(() => enforce(-1).isPositive()).toThrow();

    // isNegative
    enforce(-1).isNegative();
    enforce(-100).isNegative();

    expect(() => enforce(0).isNegative()).toThrow();
    expect(() => enforce(1).isNegative()).toThrow();
  });
});

describe('length-based rules (arrays and strings)', () => {
  it('lengthEquals / lengthNotEquals', () => {
    // lengthEquals
    enforce([1]).lengthEquals(1);
    enforce('a').lengthEquals(1);
    enforce([1, 2, 3]).lengthEquals(3);
    enforce('hello').lengthEquals(5);

    expect(() => enforce([1, 2]).lengthEquals(1)).toThrow();
    expect(() => enforce('').lengthEquals(1)).toThrow();

    // lengthNotEquals
    enforce([1]).lengthNotEquals(0);
    enforce('a').lengthNotEquals(3);
    enforce([]).lengthNotEquals(1);

    expect(() => enforce([1]).lengthNotEquals(1)).toThrow();
    expect(() => enforce('').lengthNotEquals(0)).toThrow();
  });

  it('longerThan / longerThanOrEquals', () => {
    // longerThan
    enforce([1]).longerThan(0);
    enforce('ab').longerThan(1);
    enforce([1, 2, 3]).longerThan(2);

    expect(() => enforce([1]).longerThan(2)).toThrow();
    expect(() => enforce('').longerThan(0)).toThrow();
    expect(() => enforce([1]).longerThan(1)).toThrow();

    // longerThanOrEquals
    enforce([1]).longerThanOrEquals(1);
    enforce('a').longerThanOrEquals(1);
    enforce([1]).longerThanOrEquals(0);
    enforce('ab').longerThanOrEquals(1);

    expect(() => enforce([1]).longerThanOrEquals(2)).toThrow();
    expect(() => enforce('').longerThanOrEquals(1)).toThrow();
  });

  it('shorterThan / shorterThanOrEquals', () => {
    // shorterThan
    enforce([]).shorterThan(1);
    enforce('a').shorterThan(2);
    enforce([1, 2]).shorterThan(3);

    expect(() => enforce([1]).shorterThan(0)).toThrow();
    expect(() => enforce('').shorterThan(0)).toThrow();
    expect(() => enforce([1]).shorterThan(1)).toThrow();

    // shorterThanOrEquals
    enforce([]).shorterThanOrEquals(1);
    enforce('a').shorterThanOrEquals(2);
    enforce([]).shorterThanOrEquals(0);
    enforce('a').shorterThanOrEquals(1);

    expect(() => enforce([1]).shorterThanOrEquals(0)).toThrow();
    expect(() => enforce('ab').shorterThanOrEquals(1)).toThrow();
  });

  it('minLength / maxLength', () => {
    // minLength (alias for longerThanOrEquals)
    enforce([1, 2]).minLength(2);
    enforce('hello').minLength(3);

    expect(() => enforce([1]).minLength(2)).toThrow();
    expect(() => enforce('hi').minLength(5)).toThrow();

    // maxLength (alias for shorterThanOrEquals)
    enforce([1, 2]).maxLength(3);
    enforce('hello').maxLength(5);

    expect(() => enforce([1, 2, 3]).maxLength(2)).toThrow();
    expect(() => enforce('hello').maxLength(3)).toThrow();
  });
});

describe('regex matching - matches / notMatches', () => {
  it('matches: accepts RegExp or string pattern', () => {
    // With RegExp objects
    enforce(1984).matches(/[0-9]/);
    enforce('1984').matches(/[0-9]/);
    enforce('198four').matches(/[0-9]/);

    // With string patterns
    enforce(1984).matches('[0-9]');
    enforce('1984').matches('[0-9]');
    enforce('198four').matches('[0-9]');

    // More complex patterns
    enforce('test@example.com').matches(/@/);
    enforce('hello123').matches(/[a-z]+[0-9]+/);

    expect(() => enforce('ninety eighty four').matches(/[0-9]/)).toThrow();
    expect(() => enforce('ninety eighty four').matches('[0-9]')).toThrow();
    expect(() => enforce('no digits here').matches(/\d/)).toThrow();
  });

  it('notMatches', () => {
    enforce('ninety eighty four').notMatches('[0-9]');
    enforce('hello').notMatches(/[0-9]/);
    enforce('abc').notMatches(/\d/);

    expect(() => enforce(1984).notMatches(/[0-9]/)).toThrow();
    expect(() => enforce('hello123').notMatches(/[0-9]/)).toThrow();
  });
});

describe('container membership - inside / notInside', () => {
  it('inside: string contains substring', () => {
    enforce('a').inside('cat');
    enforce('at').inside('cat');
    enforce('da').inside('tru dat.');

    expect(() => enforce('ad').inside('tru dat.')).toThrow();
    expect(() => enforce('x').inside('cat')).toThrow();
  });

  it('inside: array contains element', () => {
    enforce('x').inside(['x', 'y', 'z']);
    enforce(1).inside([1, 2, 3]);
    enforce(false).inside([true, false]);

    // Array of values checks if all are in container
    enforce(['x', 'y']).inside(['x', 'y', 'z']);

    expect(() => enforce('w').inside(['x', 'y', 'z'])).toThrow();
    expect(() => enforce(4).inside([1, 2, 3])).toThrow();
    expect(() => enforce('hello!').inside(['hello', 'world'])).toThrow();
  });

  it('notInside', () => {
    // String not in string
    enforce('ad').notInside('tru dat.');
    enforce('x').notInside('dog');

    // Element not in array
    enforce('w').notInside(['x', 'y', 'z']);
    enforce(3).notInside([1, 2]);
    enforce('hello!').notInside(['hello', 'world']);

    // Array with at least one item not in container
    enforce(['x', 'w']).notInside(['x', 'y', 'z']);

    expect(() => enforce('x').notInside(['x', 'y', 'z'])).toThrow();
    expect(() => enforce('da').notInside('tru dat.')).toThrow();
    expect(() => enforce('hello').notInside(['hello', 'world'])).toThrow();
  });
});

describe('booleans and truthiness', () => {
  it('isBoolean', () => {
    enforce(true).isBoolean();
    enforce(false).isBoolean();
    enforce(!!0).isBoolean();

    expect(() => enforce([]).isBoolean()).toThrow();
    expect(() => enforce('143').isBoolean()).toThrow();
    expect(() => enforce('false').isBoolean()).toThrow();
    expect(() => enforce(1).isBoolean()).toThrow();
  });

  it('isNotBoolean', () => {
    enforce('143').isNotBoolean();
    enforce(1).isNotBoolean();
    enforce([]).isNotBoolean();
    enforce({}).isNotBoolean();

    expect(() => enforce(true).isNotBoolean()).toThrow();
    expect(() => enforce(false).isNotBoolean()).toThrow();
  });

  it('equals for booleans', () => {
    enforce(true).equals(true);
    enforce(false).equals(false);

    expect(() => enforce(true).equals(false)).toThrow();
    expect(() => enforce(false).equals(true)).toThrow();
  });

  it('isTrue / isFalse', () => {
    // isTrue
    enforce(true).isTrue();

    expect(() => enforce(false).isTrue()).toThrow();
    expect(() => enforce(1).isTrue()).toThrow();
    expect(() => enforce('true').isTrue()).toThrow();

    // isFalse
    enforce(false).isFalse();

    expect(() => enforce(true).isFalse()).toThrow();
    expect(() => enforce(0).isFalse()).toThrow();
    expect(() => enforce('').isFalse()).toThrow();
  });

  it('isTruthy / isFalsy', () => {
    // isTruthy
    enforce('hi').isTruthy();
    enforce(true).isTruthy();
    enforce(1).isTruthy();
    enforce([]).isTruthy();
    enforce({}).isTruthy();

    expect(() => enforce(false).isTruthy()).toThrow();
    expect(() => enforce(null).isTruthy()).toThrow();
    expect(() => enforce(undefined).isTruthy()).toThrow();
    expect(() => enforce(0).isTruthy()).toThrow();
    expect(() => enforce(NaN).isTruthy()).toThrow();
    expect(() => enforce('').isTruthy()).toThrow();

    // isFalsy
    enforce('').isFalsy();
    enforce(false).isFalsy();
    enforce(0).isFalsy();
    enforce(undefined).isFalsy();
    enforce(null).isFalsy();
    enforce(NaN).isFalsy();

    expect(() => enforce(1).isFalsy()).toThrow();
    expect(() => enforce(true).isFalsy()).toThrow();
    expect(() => enforce('hi').isFalsy()).toThrow();
    expect(() => enforce([]).isFalsy()).toThrow();
  });
});

describe('type checks', () => {
  it('isArray / isNotArray', () => {
    // isArray
    enforce([]).isArray();
    enforce([1, 2, 3]).isArray();
    enforce(['hello']).isArray();

    expect(() => enforce({}).isArray()).toThrow();
    expect(() => enforce('hello').isArray()).toThrow();
    expect(() => enforce(123).isArray()).toThrow();

    // isNotArray
    enforce('no').isNotArray();
    enforce({}).isNotArray();
    enforce(123).isNotArray();
    enforce('hello').isNotArray();

    expect(() => enforce([]).isNotArray()).toThrow();
    expect(() => enforce([1, 2]).isNotArray()).toThrow();
  });

  it('isString / isNotString', () => {
    // isString
    enforce('a').isString();
    enforce('hello').isString();
    enforce('').isString();

    expect(() => enforce(1).isString()).toThrow();
    expect(() => enforce([]).isString()).toThrow();
    expect(() => enforce({}).isString()).toThrow();

    // isNotString
    enforce(1).isNotString();
    enforce([]).isNotString();
    enforce({}).isNotString();
    enforce(true).isNotString();

    expect(() => enforce('a').isNotString()).toThrow();
    expect(() => enforce('').isNotString()).toThrow();
  });

  it('isNumber / isNotNumber', () => {
    // isNumber
    enforce(1).isNumber();
    enforce(0).isNumber();
    enforce(-5).isNumber();
    enforce(3.14).isNumber();

    expect(() => enforce('1').isNumber()).toThrow();
    expect(() => enforce(NaN).isNumber()).toThrow();
    expect(() => enforce([]).isNumber()).toThrow();

    // isNotNumber
    enforce('1').isNotNumber();
    enforce([]).isNotNumber();
    enforce({}).isNotNumber();
    enforce(NaN).isNotNumber();

    expect(() => enforce(1).isNotNumber()).toThrow();
    expect(() => enforce(0).isNotNumber()).toThrow();
  });

  it('isNaN / isNotNaN', () => {
    // isNaN
    enforce(NaN).isNaN();
    enforce(Number('not a number')).isNaN();

    expect(() => enforce(1).isNaN()).toThrow();
    expect(() => enforce(0).isNaN()).toThrow();
    expect(() => enforce('NaN').isNaN()).toThrow();

    // isNotNaN
    enforce(1).isNotNaN();
    enforce(0).isNotNaN();
    enforce('123').isNotNaN();

    expect(() => enforce(NaN).isNotNaN()).toThrow();
  });

  it('nullish checks - isNull / isNotNull', () => {
    // isNull
    enforce(null).isNull();

    expect(() => enforce(undefined).isNull()).toThrow();
    expect(() => enforce('x').isNull()).toThrow();
    expect(() => enforce(0).isNull()).toThrow();
    expect(() => enforce(false).isNull()).toThrow();

    // isNotNull
    enforce('x').isNotNull();
    enforce(undefined).isNotNull();
    enforce(0).isNotNull();
    enforce(false).isNotNull();
    enforce([]).isNotNull();

    expect(() => enforce(null).isNotNull()).toThrow();
  });

  it('isUndefined / isNotUndefined', () => {
    // isUndefined
    enforce(undefined).isUndefined();
    let x;
    enforce(x).isUndefined();

    expect(() => enforce(null).isUndefined()).toThrow();
    expect(() => enforce('x').isUndefined()).toThrow();
    expect(() => enforce(0).isUndefined()).toThrow();

    // isNotUndefined
    enforce('x').isNotUndefined();
    enforce(null).isNotUndefined();
    enforce(0).isNotUndefined();
    enforce(false).isNotUndefined();

    expect(() => enforce(undefined).isNotUndefined()).toThrow();
  });

  it('isNullish / isNotNullish', () => {
    // isNullish
    enforce(null).isNullish();
    enforce(undefined).isNullish();

    expect(() => enforce('x').isNullish()).toThrow();
    expect(() => enforce(0).isNullish()).toThrow();
    expect(() => enforce(false).isNullish()).toThrow();
    expect(() => enforce('').isNullish()).toThrow();

    // isNotNullish
    enforce('x').isNotNullish();
    enforce(0).isNotNullish();
    enforce(false).isNotNullish();
    enforce('').isNotNullish();
    enforce([]).isNotNullish();

    expect(() => enforce(null).isNotNullish()).toThrow();
    expect(() => enforce(undefined).isNotNullish()).toThrow();
  });
});

describe('string specific rules', () => {
  it('startsWith / doesNotStartWith', () => {
    // startsWith
    enforce('hello').startsWith('he');
    enforce('hello').startsWith('h');
    enforce('hello').startsWith('hello');

    expect(() => enforce('hello').startsWith('yo')).toThrow();
    expect(() => enforce('hello').startsWith('lo')).toThrow();

    // doesNotStartWith
    enforce('hello').doesNotStartWith('yo');
    enforce('hello').doesNotStartWith('lo');
    enforce('hello').doesNotStartWith('x');

    expect(() => enforce('hello').doesNotStartWith('he')).toThrow();
    expect(() => enforce('hello').doesNotStartWith('h')).toThrow();
  });

  it('endsWith / doesNotEndWith', () => {
    // endsWith
    enforce('hello').endsWith('lo');
    enforce('hello').endsWith('o');
    enforce('hello').endsWith('hello');

    expect(() => enforce('hello').endsWith('yo')).toThrow();
    expect(() => enforce('hello').endsWith('he')).toThrow();

    // doesNotEndWith
    enforce('hello').doesNotEndWith('yo');
    enforce('hello').doesNotEndWith('he');
    enforce('hello').doesNotEndWith('x');

    expect(() => enforce('hello').doesNotEndWith('lo')).toThrow();
    expect(() => enforce('hello').doesNotEndWith('o')).toThrow();
  });

  it('isBlank / isNotBlank', () => {
    // isBlank - empty or only whitespace
    enforce('').isBlank();
    enforce('   ').isBlank();
    enforce('\t').isBlank();
    enforce('\n').isBlank();
    enforce('  \t  \n  ').isBlank();

    expect(() => enforce('x').isBlank()).toThrow();
    expect(() => enforce(' x ').isBlank()).toThrow();

    // isNotBlank
    enforce('x').isNotBlank();
    enforce(' x ').isNotBlank();
    enforce('hello').isNotBlank();

    expect(() => enforce('').isNotBlank()).toThrow();
    expect(() => enforce('   ').isNotBlank()).toThrow();
    expect(() => enforce('\t\n').isNotBlank()).toThrow();
  });
});

describe('object key/value membership', () => {
  it('isKeyOf / isNotKeyOf', () => {
    const o = { a: 1, b: 2, c: 3 };

    // isKeyOf
    enforce('a').isKeyOf(o);
    enforce('b').isKeyOf(o);
    enforce('c').isKeyOf(o);

    expect(() => enforce('d').isKeyOf(o)).toThrow();
    expect(() => enforce('z').isKeyOf(o)).toThrow();
    expect(() => enforce(1).isKeyOf(o)).toThrow();

    // isNotKeyOf
    enforce('z').isNotKeyOf(o);
    enforce('d').isNotKeyOf(o);
    enforce('x').isNotKeyOf(o);

    expect(() => enforce('a').isNotKeyOf(o)).toThrow();
    expect(() => enforce('b').isNotKeyOf(o)).toThrow();
  });

  it('isValueOf / isNotValueOf', () => {
    const o = { a: 1, b: 2, c: 3 } as const;

    // isValueOf
    enforce(1).isValueOf(o);
    enforce(2).isValueOf(o);
    enforce(3).isValueOf(o);

    expect(() => enforce(4).isValueOf(o)).toThrow();
    expect(() => enforce(0).isValueOf(o)).toThrow();
    expect(() => enforce('a').isValueOf(o)).toThrow();

    // isNotValueOf
    enforce(4).isNotValueOf(o);
    enforce(0).isNotValueOf(o);
    enforce(10).isNotValueOf(o);

    expect(() => enforce(1).isNotValueOf(o)).toThrow();
    expect(() => enforce(2).isNotValueOf(o)).toThrow();
  });

  it('handles edge cases for objects', () => {
    const objWithZero = { x: 0, y: false, z: '' };

    // 0, false, and '' are valid values
    enforce(0).isValueOf(objWithZero);
    enforce(false).isValueOf(objWithZero);
    enforce('').isValueOf(objWithZero);

    const objWithNull = { a: null, b: undefined };
    enforce(null).isValueOf(objWithNull);
    enforce(undefined).isValueOf(objWithNull);
  });
});

describe('chaining across categories', () => {
  it('mix string checks with length and membership', () => {
    enforce('cat')
      .isString()
      .longerThan(2)
      .startsWith('c')
      .inside('concatenate');

    enforce('hello')
      .isString()
      .lengthEquals(5)
      .startsWith('he')
      .endsWith('lo')
      .matches(/[a-z]+/);
  });

  it('mix numeric string with numeric comparisons', () => {
    enforce('42').isNumeric().greaterThan(10).lessThan(100).numberEquals('42');

    enforce(50).isNumber().greaterThan(0).lessThan(100).isEven().isPositive();
  });

  it('chain array checks', () => {
    enforce([1, 2, 3]).isArray().lengthEquals(3).longerThan(2);

    enforce(['a', 'b']).isArray().isNotEmpty().shorterThan(5);
  });

  it('chain boolean checks', () => {
    enforce(true).isBoolean().isTrue().isTruthy().equals(true);

    enforce(false).isBoolean().isFalse().isFalsy();
  });

  it('unsupported chain should fail where appropriate', () => {
    // length operators on non-lengthable types
    expect(() => enforce(123 as any).longerThan(2)).toThrow();
    expect(() => enforce(true as any).lengthEquals(1)).toThrow();

    // regex on non-string/number
    expect(() => enforce({} as any).matches(/x/)).toThrow();
    expect(() => enforce([] as any).matches(/x/)).toThrow();

    // numeric comparisons on non-numeric
    expect(() => enforce('x' as any).greaterThan(1)).toThrow();
    expect(() => enforce([] as any).lessThan(5)).toThrow();
  });

  it('stops at the first failing rule in a chain', () => {
    // After first failure, a throw occurs; later rules should not be evaluated.
    expect(() => enforce('a').isString().equals('a').lessThan('a')).toThrow();

    expect(() => enforce(5).isNumber().greaterThan(10).lessThan(20)).toThrow(); // fails at greaterThan(10)
  });

  it('complex real-world validation chains', () => {
    // Username validation
    enforce('john_doe_123')
      .isString()
      .isNotEmpty()
      .longerThan(5)
      .shorterThan(20)
      .matches(/^[a-zA-Z0-9_]+$/);

    // Price validation
    enforce(99.99).isNumber().isPositive().greaterThan(0).lessThan(1000);

    // Email-like string validation
    enforce('test@example.com')
      .isString()
      .isNotEmpty()
      .matches(/@/)
      .matches(/\./)
      .longerThan(5);
  });
});

it('array includes', () => {
  // includes checks if array contains an element
  enforce([1, 2, 3]).includes(1);
  enforce([1, 2, 3]).includes(2);
  enforce(['a', 'b', 'c']).includes('b');

  expect(() => enforce([1, 2, 3]).includes(4)).toThrow();
  expect(() => enforce(['a', 'b']).includes('c')).toThrow();
  expect(() => enforce([]).includes(1)).toThrow();
});

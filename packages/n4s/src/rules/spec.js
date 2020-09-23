import rules from '.';

describe('Tests enforce rules API', () => {
  it('Should expose all enforce rules', () => {
    allRules.forEach(rule => {
      expect(rules[rule]).toBeInstanceOf(Function);
    });
  });

  it('Exposed rule count should match actual count', () => {
    expect(Object.keys(rules)).toHaveLength(allRules.length);
  });
});

const negativeRules = [
  'isNotArray',
  'isNotEmpty',
  'isNotNaN',
  'isNotNumber',
  'isNotNumeric',
  'isNotString',
  'isNotUndefined',
  'lengthNotEquals',
  'notEquals',
  'notInside',
  'notMatches',
  'doesNotEndWith',
  'numberNotEquals',
  'isNotNull',
];

const positiveRules = [
  'equals',
  'greaterThan',
  'greaterThanOrEquals',
  'gt',
  'gte',
  'inside',
  'isArray',
  'isEmpty',
  'isEven',
  'isNaN',
  'isNumber',
  'isNumeric',
  'isOdd',
  'isTruthy',
  'isFalsy',
  'isString',
  'isUndefined',
  'lengthEquals',
  'lessThan',
  'lessThanOrEquals',
  'longerThan',
  'longerThanOrEquals',
  'lt',
  'lte',
  'matches',
  'numberEquals',
  'shorterThan',
  'shorterThanOrEquals',
  'isNull',
  'endsWith'
];

const allRules = [...new Set([...positiveRules, ...negativeRules])];

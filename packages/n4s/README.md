# n4s (enforce)

`enforce` is Vest's standalone assertion library. It powers Vest's validations and can be used directly to express fluent, chainable rules for any data structure.

## Quick start

```bash
npm i n4s
```

```js
import { enforce } from 'n4s';

enforce('hello').isString().longerThan(2);
enforce(7).isNumber().greaterThan(2).lessThanOrEquals(10);
```

Every rule throws when the assertion fails. Chain as many rules as you need; execution stops on the first failing rule.

## Lazy mode

If you prefer to inspect results without throwing, build a chain and call `.run(value)`:

```js
const numberCheck = enforce.isNumber().greaterThan(0);

const ok = numberCheck.run(5); // { pass: true, type: 5 }
const bad = numberCheck.run('5'); // { pass: false, type: '5' }
```

## Built-in rules

Rules cover common types and comparisons:

- Equality: `equals`, `notEquals`, `numberEquals`, `numberNotEquals`.
- Presence: `isEmpty`, `isNotEmpty`, `isBlank`, `isNotBlank`, `isNullish`, `isNotNullish`.
- Type checks: `isArray`, `isBoolean`, `isNumber`, `isString`, `isNaN`, plus negated forms.
- Comparisons: `greaterThan`, `greaterThanOrEquals`, `lessThan`, `lessThanOrEquals`, `between`, `notBetween`, `longerThan`, `shorterThan`, `lengthEquals`, `lengthNotEquals`.
- String helpers: `startsWith`, `doesNotStartWith`, `endsWith`, `doesNotEndWith`, `matches`, `notMatches`.
- Collections: `includes`, `inside`, `notInside`, `isKeyOf`, `isValueOf`.
- Booleans and truthiness: `isTruthy`, `isFalsy`, `isTrue`, `isFalse`.
- Numeric sanity: `isPositive`, `isNegative`, `isEven`, `isOdd`, `isNumeric`.

Plugins add higher-level checks such as `isEmail` and date helpers (`isDate`, `isAfter`, `isBefore`, `isISO8601`).

## Custom rules

Extend enforce with your own assertions using `enforce.extend`.

```js
import { enforce } from 'n4s';

enforce.extend({
  isBetweenExclusive: (value, min, max) => ({
    pass: value > min && value < max,
    message: () => `${value} must be between ${min} and ${max}`,
  }),
});

enforce(10).isBetweenExclusive(5, 15);
```

Rules can return a boolean or an object with `{ pass, message }`. Custom rules work in both throwing and lazy (`.run`) modes.

## Composing rules

Use compound helpers to combine conditions without writing new functions:

```js
enforce.allOf(enforce.isString(), enforce.longerThan(2)).run('Vest'); // pass: true

enforce.anyOf(enforce.equals('foo'), enforce.equals('bar')).run('bar');
```

`allOf`, `anyOf`, and `noneOf` evaluate other rules and return a single result, enabling reusable rule sets.

## Using with Vest

When imported from `vest`, `enforce` integrates with Vest tests, but it remains a standalone utility you can use anywhere you need fast, expressive assertions.

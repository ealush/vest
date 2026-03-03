import { describe, test, expect } from 'vitest';
import * as vest from '../../vest';
import { enforce } from '../../vest';

describe('suiteResult.getData()', () => {
  describe('without schema', () => {
    test('Should return the input data that was passed to the suite run', () => {
      const suite = vest.create((data: { id: number }) => {
        vest.test('id', () => {
          vest.enforce(data.id).isTruthy();
        });
      });

      const data = { id: 1 };
      const res = suite.run(data);
      expect(res.getData()).toBe(data);
      expect(suite.get().getData()).toBe(data);
    });

    test('Should return undefined if no data was passed', () => {
      const suite = vest.create(() => {
        vest.test('id', () => {
          vest.enforce(1).isTruthy();
        });
      });

      const res = suite.run();
      expect(res.getData()).toBeUndefined();
    });
  });

  describe('with schema validation', () => {
    test('Should return the original input data if validation fails', () => {
      const schema = enforce.shape({
        age: enforce.isNumber(),
      });

      const suite = vest.create(() => {
        vest.test('age', 'Must be adult', () => {
          vest.enforce(1).isTruthy();
        });
      }, schema);

      // Pass bad string data that causes parse to fail gracefully (isValidation=true)
      const input = { age: 'not_a_number' };

      // @ts-expect-error - testing invalid input
      const res = suite.run(input);

      // Suite fails the schema parse, it falls back to raw data
      expect(res.getData()).toBe(input);
    });

    test('Should return the parsed object data successfully if validation passes', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
      });

      const suite = vest.create(() => {
        vest.test('age', 'Must be valid', () => {
          vest.enforce(1).isTruthy();
        });
      }, schema);

      // @ts-expect-error - testing coercable string input
      const res = suite.run({ age: '25' });
      // The parsed output contains a number
      expect(res.getData()).toEqual({ age: 25 });
    });

    test('Should selectively parse focused rules bypassing failing background payload states', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
        score: enforce.isNumber(), // not numeric, requires strict number
      });

      const suite = vest.create(() => {
        vest.test('age', 'Must be valid', () => {
          vest.enforce(1).isTruthy();
        });
        vest.test('score', 'Score test', () => {
          vest.enforce(1).isTruthy();
        });
      }, schema);

      // We focus only on age, ignoring the strictly broken 'score'
      const res = suite
        .focus({ only: 'age' })
        // @ts-expect-error - testing invalid score type
        .run({ age: '25', score: 'invalid_string' });

      // Validation passes for 'age', schema parsing coerces age successfully!
      // 'score' goes unparsed since we never ran the broken rule against it natively.
      expect(res.getErrors('age')).toEqual([]);
      expect(res.getErrors('score')).toEqual([]);
      expect(res.getData()).toEqual({ age: 25, score: 'invalid_string' });
    });

    test('Should prioritize intersecting skip states dropping matching only fields from parsed validations', () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
        score: enforce.isNumeric().toNumber(),
      });

      const suite = vest.create(() => {
        vest.test('age', () => {
          vest.enforce(1).isTruthy();
        });
        vest.test('score', () => {
          vest.enforce(1).isTruthy();
        });
      }, schema);

      // Only age and score are targeted, BUT skip overrides and drops score.
      // So ONLY 'age' actually gets executed and parsed gracefully!

      const res = suite
        .focus({ only: ['age', 'score'], skip: ['score'] })
        // @ts-expect-error - testing invalid score type natively
        .run({ age: '25', score: 'not_numeric' });

      expect(res.getErrors('age')).toEqual([]); // 'age' passed
      expect(res.getErrors('score')).toEqual([]); // 'score' was skipped

      // 'age' is parsed into a number (25). 'score' was skipped, so it fails to parse natively and remains the raw invalid input!
      expect(res.getData()).toEqual({ age: 25, score: 'not_numeric' });
    });
  });
});

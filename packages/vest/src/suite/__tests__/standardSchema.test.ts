import { describe, expect, expectTypeOf, it } from 'vitest';

import { create, test, enforce } from '../../vest';

describe('StandardSchemaV1 Adherence', () => {
  describe('~standard property', () => {
    it('should exist on the suite object', () => {
      const suite = create(() => {});
      expect(suite).toHaveProperty('~standard');
    });

    it('should have version 1', () => {
      const suite = create(() => {});
      expect(suite['~standard'].version).toBe(1);
    });

    it('should have vendor "vest"', () => {
      const suite = create(() => {});
      expect(suite['~standard'].vendor).toBe('vest');
    });

    it('should have a validate function', () => {
      const suite = create(() => {});
      expect(typeof suite['~standard'].validate).toBe('function');
    });
  });

  describe('validate function', () => {
    it('should return a Standard Schema result', async () => {
      const suite = create(() => {});
      const result = await suite['~standard'].validate({});

      expect(result).toHaveProperty('value');
      expect(result).not.toHaveProperty('issues');
    });

    it('should await async tests before returning a Standard Schema result', async () => {
      const suite = create((data: { username: string }) => {
        test('username', 'Username is already taken', async () => {
          await Promise.resolve();
          enforce(data.username).notEquals('taken');
        });
      });

      const result = await suite['~standard'].validate({ username: 'taken' });

      expect(result).toEqual({
        issues: [
          {
            message: 'Username is already taken',
            path: ['username'],
          },
        ],
      });
    });

    it('should return parsed output from a schema-backed suite', async () => {
      const schema = enforce.shape({
        age: enforce.isNumeric().toNumber(),
      });
      const suite = create(() => {}, schema);
      type StandardTypes = NonNullable<(typeof suite)['~standard']['types']>;

      expectTypeOf<StandardTypes['input']>().toEqualTypeOf<{
        age: string | number;
      }>();
      expectTypeOf<StandardTypes['output']>().toEqualTypeOf<{ age: number }>();

      expect(suite.runStatic({ age: '42' }).run.data.parsed).toEqual({
        age: 42,
      });

      const result = await suite['~standard'].validate({ age: '42' });

      expect(result).toEqual({ value: { age: 42 } });
    });
  });

  describe('SuiteResult as StandardSchemaV1.Result', () => {
    describe('Success case', () => {
      const suite = create((data: { username: string }) => {
        test('username', 'must be at least 3 chars', () => {
          enforce(data.username).longerThan(2);
        });
      });

      const data = { username: 'test' };
      const result = suite.validate(data);

      it('should have valid: true', () => {
        expect(result.valid).toBe(true);
      });

      it('should have a value property with the validated data', () => {
        expect(result.value).toBe(data);
      });

      it('should not have an issues property', () => {
        expect(result.issues).toBeUndefined();
      });
    });

    describe('Failure case', () => {
      const suite = create((data: { username: string }) => {
        test('username', 'must be at least 3 chars', () => {
          enforce(data.username).longerThan(2);
        });
      });

      const data = { username: 't' };
      const result = suite.validate(data);

      it('should have valid: false', () => {
        expect(result.valid).toBe(false);
      });

      it('should not have a value property', () => {
        expect(result.value).toBeUndefined();
      });

      it('should have an issues property that is an array', () => {
        expect(Array.isArray(result.issues)).toBe(true);
      });

      it('each issue should have a message and a path', () => {
        if (!result.issues) {
          throw new Error('issues should be defined for a failing suite');
        }
        expect(result.issues[0]).toHaveProperty('message');
        expect(result.issues[0]).toHaveProperty('path');
        expect(typeof result.issues[0].message).toBe('string');
        expect(Array.isArray(result.issues[0].path)).toBe(true);
      });

      it('should have the correct issue details', () => {
        expect(result.issues).toEqual([
          {
            message: 'must be at least 3 chars',
            path: ['username'],
          },
        ]);
      });
    });
  });
});

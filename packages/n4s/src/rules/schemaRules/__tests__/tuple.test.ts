import { describe, it, expect, expectTypeOf } from 'vitest';

import { enforce } from '../../../n4s';

describe('enforce.tuple()', () => {
  describe('basic validation', () => {
    it('passes for valid tuple', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      expect(schema.test(['hello', 42])).toBe(true);
    });

    it('fails when element has wrong type', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      // @ts-expect-error - intentionally passing wrong type for first element
      expect(schema.test([42, 42])).toBe(false);
      // @ts-expect-error - intentionally passing wrong type for second element
      expect(schema.test(['hello', 'world'])).toBe(false);
    });

    it('fails when too few elements', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      // @ts-expect-error - intentionally passing too few elements
      expect(schema.test(['hello'])).toBe(false);
    });

    it('fails when too many elements', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      // @ts-expect-error - intentionally passing too many elements
      expect(schema.test(['hello', 42, true])).toBe(false);
    });

    it('fails for non-array values', () => {
      const schema = enforce.tuple(enforce.isString());
      // @ts-expect-error - intentionally passing non-array
      expect(schema.test('not an array')).toBe(false);
      // @ts-expect-error - intentionally passing non-array
      expect(schema.test({ 0: 'a' })).toBe(false);
      // @ts-expect-error - intentionally passing null
      expect(schema.test(null)).toBe(false);
      // @ts-expect-error - intentionally passing undefined
      expect(schema.test(undefined)).toBe(false);
    });

    it('passes for empty tuple schema with empty array', () => {
      const emptyTuple = enforce.tuple();
      expect(emptyTuple.test([])).toBe(true);
      // @ts-expect-error - intentionally passing elements to empty tuple
      expect(emptyTuple.test(['extra'])).toBe(false);
    });
  });

  describe('with optional trailing elements', () => {
    it('passes without optional element', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.optional(enforce.isNumber()),
      );
      // @ts-expect-error - runtime allows omitting optional trailing elements
      expect(schema.test(['hello'])).toBe(true);
    });

    it('passes with optional element present', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.optional(enforce.isNumber()),
      );
      expect(schema.test(['hello', 42])).toBe(true);
    });

    it('fails when optional element has wrong type', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.optional(enforce.isNumber()),
      );
      // @ts-expect-error - intentionally passing wrong type for optional element
      expect(schema.test(['hello', 'not a number'])).toBe(false);
    });

    it('handles multiple trailing optional elements', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.optional(enforce.isNumber()),
        enforce.optional(enforce.isBoolean()),
      );
      // @ts-expect-error - runtime allows omitting optional trailing elements
      expect(schema.test(['hello'])).toBe(true);
      // @ts-expect-error - runtime allows omitting optional trailing elements
      expect(schema.test(['hello', 42])).toBe(true);
      expect(schema.test(['hello', 42, true])).toBe(true);
      // @ts-expect-error - intentionally passing too many elements
      expect(schema.test(['hello', 42, true, 'extra'])).toBe(false);
    });
  });

  describe('nested schemas', () => {
    it('supports shape elements', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.shape({ id: enforce.isNumber() }),
      );

      expect(schema.test(['test', { id: 1 }])).toBe(true);
      // @ts-expect-error - intentionally passing wrong type for nested field
      expect(schema.test(['test', { id: 'x' }])).toBe(false);
    });

    it('supports nested tuples', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.tuple(enforce.isNumber(), enforce.isNumber()),
      );

      expect(schema.test(['coords', [1, 2]])).toBe(true);
      // @ts-expect-error - intentionally passing wrong type in nested tuple
      expect(schema.test(['coords', [1, 'x']])).toBe(false);
    });

    it('supports isArrayOf elements', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.isArrayOf(enforce.isNumber()),
      );

      expect(schema.test(['tags', [1, 2, 3]])).toBe(true);
      // @ts-expect-error - intentionally passing wrong type in array
      expect(schema.test(['tags', [1, 'x']])).toBe(false);
    });
  });

  describe('eager API', () => {
    it('throws on invalid tuple', () => {
      expect(() => {
        enforce(['hello', 'world']).tuple(
          enforce.isString(),
          enforce.isNumber(),
        );
      }).toThrow();
    });

    it('does not throw on valid tuple', () => {
      expect(() => {
        enforce(['hello', 42]).tuple(enforce.isString(), enforce.isNumber());
      }).not.toThrow();
    });
  });

  describe('error reporting', () => {
    it('reports index of failing element in path', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.isNumber(),
        enforce.isBoolean(),
      );

      // @ts-expect-error - intentionally passing wrong type
      const result = schema.run(['ok', 'bad', true]);
      expect(result.pass).toBe(false);
      expect(result.path).toBeDefined();
      expect(result.path![0]).toBe('1');
    });

    it('reports nested error path through tuple boundary', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.shape({ id: enforce.isNumber() }),
      );

      // @ts-expect-error - intentionally passing wrong type for nested field
      const result = schema.run(['ok', { id: 'bad' }]);
      expect(result.pass).toBe(false);
      expect(result.path).toEqual(['1', 'id']);
    });
  });

  describe('RuleInstance methods', () => {
    it('.test() returns boolean', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      expect(typeof schema.test(['a', 1])).toBe('boolean');
    });

    it('.run() returns RuleRunReturn', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      expect(schema.run(['a', 1]).pass).toBe(true);
      // @ts-expect-error - intentionally passing wrong type
      expect(schema.run(['a', 'b']).pass).toBe(false);
    });

    it('.validate() returns StandardSchema result', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      const passing = schema.validate(['a', 1]);
      expect(passing).toHaveProperty('value');
      expect(passing).not.toHaveProperty('issues');

      // @ts-expect-error - intentionally passing wrong type
      const failing = schema.validate(['a', 'b']);
      expect(failing).toHaveProperty('issues');
    });

    it('.parse() returns value on success and throws on failure', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      expect(schema.parse(['a', 1])).toEqual(['a', 1]);
      // @ts-expect-error - intentionally passing wrong type
      expect(() => schema.parse(['a', 'b'])).toThrow();
    });
  });

  describe('.message() override', () => {
    it('supports custom message', () => {
      const schema = enforce
        .tuple(enforce.isString(), enforce.isNumber())
        .message('Invalid coordinate');
      const result = schema.run(['a', 'b']);
      expect(result.pass).toBe(false);
      expect(result.message).toBe('Invalid coordinate');
    });
  });

  describe('type inference', () => {
    it('infers tuple type from rules', () => {
      const schema = enforce.tuple(
        enforce.isString(),
        enforce.isNumber(),
        enforce.isBoolean(),
      );

      type Inferred = typeof schema.infer;
      expectTypeOf<Inferred>().toEqualTypeOf<[string, number, boolean]>();
    });

    it('enforce.infer<> works with tuple', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());

      type ViaInfer = enforce.infer<typeof schema>;
      expectTypeOf<ViaInfer>().toEqualTypeOf<[string, number]>();
    });

    it('infers tuple inside shape', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
        coords: enforce.tuple(enforce.isNumber(), enforce.isNumber()),
      });

      type S = typeof schema.infer;
      expectTypeOf<S>().toEqualTypeOf<{
        name: string;
        coords: [number, number];
      }>();
    });

    it('parse() return type is correctly inferred', () => {
      const schema = enforce.tuple(enforce.isString(), enforce.isNumber());
      // eslint-disable-next-line vitest/valid-expect
      expectTypeOf(schema.parse).returns.toEqualTypeOf<[string, number]>();
    });
  });
});

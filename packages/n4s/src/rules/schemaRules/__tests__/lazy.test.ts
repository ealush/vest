import { describe, it, expect } from 'vitest';

import { enforce, compose } from '../../../n4s';
import type { RuleInstance } from '../../../utils/RuleInstance';

describe('enforce.lazy()', () => {
  describe('recursive shape validation', () => {
    it('validates a simple recursive tree', () => {
      const treeSchema: RuleInstance<any> = enforce.shape({
        value: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => treeSchema)),
      });

      expect(
        treeSchema.test({
          value: 1,
          children: [
            { value: 2, children: [] },
            {
              value: 3,
              children: [{ value: 4, children: [] }],
            },
          ],
        }),
      ).toBe(true);
    });

    it('fails on invalid nested node', () => {
      const treeSchema: RuleInstance<any> = enforce.shape({
        value: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => treeSchema)),
      });

      expect(
        treeSchema.test({
          value: 1,
          children: [{ value: 'not a number', children: [] }],
        }),
      ).toBe(false);
    });

    it('validates leaf nodes (empty children array)', () => {
      const treeSchema: RuleInstance<any> = enforce.shape({
        value: enforce.isString(),
        children: enforce.isArrayOf(enforce.lazy(() => treeSchema)),
      });

      expect(treeSchema.test({ value: 'leaf', children: [] })).toBe(true);
    });

    it('fails when nested node is missing required fields', () => {
      const treeSchema: RuleInstance<any> = enforce.shape({
        value: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => treeSchema)),
      });

      expect(
        treeSchema.test({
          value: 1,
          children: [{ value: 2 }],
        }),
      ).toBe(false);
    });
  });

  describe('optional recursive fields', () => {
    it('validates a binary tree with optional left/right', () => {
      const binaryTree: RuleInstance<any> = enforce.shape({
        value: enforce.isNumber(),
        left: enforce.optional(enforce.lazy(() => binaryTree)),
        right: enforce.optional(enforce.lazy(() => binaryTree)),
      });

      expect(binaryTree.test({ value: 1 })).toBe(true);
      expect(binaryTree.test({ value: 1, left: { value: 2 } })).toBe(true);
      expect(
        binaryTree.test({
          value: 1,
          left: { value: 2, right: { value: 3 } },
        }),
      ).toBe(true);
    });

    it('fails on invalid optional nested node', () => {
      const binaryTree: RuleInstance<any> = enforce.shape({
        value: enforce.isNumber(),
        left: enforce.optional(enforce.lazy(() => binaryTree)),
        right: enforce.optional(enforce.lazy(() => binaryTree)),
      });

      expect(
        binaryTree.test({
          value: 1,
          left: { value: 'invalid' },
        }),
      ).toBe(false);
    });
  });

  describe('factory caching', () => {
    it('calls the factory only once across recursive calls', () => {
      let callCount = 0;
      const schema: RuleInstance<any> = enforce.shape({
        val: enforce.isNumber(),
        next: enforce.optional(
          enforce.lazy(() => {
            callCount++;
            return schema;
          }),
        ),
      });

      schema.test({ val: 1, next: { val: 2, next: { val: 3 } } });
      expect(callCount).toBe(1);
    });

    it('reuses cached schema across multiple validations', () => {
      let callCount = 0;
      const schema: RuleInstance<any> = enforce.shape({
        val: enforce.isNumber(),
        next: enforce.optional(
          enforce.lazy(() => {
            callCount++;
            return schema;
          }),
        ),
      });

      schema.test({ val: 1, next: { val: 2 } });
      schema.test({ val: 3, next: { val: 4 } });
      expect(callCount).toBe(1);
    });
  });

  describe('deep nesting', () => {
    it('validates a deeply nested structure (5+ levels)', () => {
      const nodeSchema: RuleInstance<any> = enforce.shape({
        id: enforce.isNumber(),
        child: enforce.optional(enforce.lazy(() => nodeSchema)),
      });

      expect(
        nodeSchema.test({
          id: 1,
          child: {
            id: 2,
            child: {
              id: 3,
              child: {
                id: 4,
                child: {
                  id: 5,
                  child: { id: 6 },
                },
              },
            },
          },
        }),
      ).toBe(true);
    });

    it('detects failure deep in nested structure', () => {
      const nodeSchema: RuleInstance<any> = enforce.shape({
        id: enforce.isNumber(),
        child: enforce.optional(enforce.lazy(() => nodeSchema)),
      });

      expect(
        nodeSchema.test({
          id: 1,
          child: {
            id: 2,
            child: {
              id: 3,
              child: {
                id: 'invalid',
              },
            },
          },
        }),
      ).toBe(false);
    });
  });

  describe('RuleInstance methods', () => {
    it('.test() returns boolean', () => {
      const schema: RuleInstance<any> = enforce.shape({
        val: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => schema)),
      });

      expect(typeof schema.test({ val: 1, children: [] })).toBe('boolean');
    });

    it('.run() returns RuleRunReturn', () => {
      const schema: RuleInstance<any> = enforce.shape({
        val: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => schema)),
      });

      const passing = schema.run({ val: 1, children: [] });
      expect(passing.pass).toBe(true);

      const failing = schema.run({ val: 'bad', children: [] });
      expect(failing.pass).toBe(false);
    });

    it('.validate() returns StandardSchema result', () => {
      const schema: RuleInstance<any> = enforce.shape({
        val: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => schema)),
      });

      const passing = schema.validate({ val: 1, children: [] });
      expect(passing).toHaveProperty('value');
      expect(passing).not.toHaveProperty('issues');

      const failing = schema.validate({ val: 'bad', children: [] });
      expect(failing).toHaveProperty('issues');
    });

    it('.parse() returns value on success and throws on failure', () => {
      const schema: RuleInstance<any> = enforce.shape({
        val: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => schema)),
      });

      const data = { val: 1, children: [] };
      expect(schema.parse(data)).toEqual(data);

      expect(() => schema.parse({ val: 'bad', children: [] })).toThrow();
    });
  });

  describe('.message() override', () => {
    it('supports custom message on lazy wrapper', () => {
      const inner = enforce.shape({
        val: enforce.isNumber(),
      });

      const lazyInner = enforce.lazy(() => inner).message('Custom lazy error');
      const result = lazyInner.run({ val: 'bad' });

      expect(result.pass).toBe(false);
      expect(result.message).toBe('Custom lazy error');
    });
  });

  describe('compose + lazy', () => {
    it('works with compose()', () => {
      const nodeSchema: RuleInstance<any> = enforce.shape({
        id: enforce.isString(),
        children: enforce.isArrayOf(enforce.lazy(() => nodeSchema)),
      });

      const validatedNode = compose(nodeSchema, enforce.isNotEmpty());

      expect(
        validatedNode.test({
          id: 'root',
          children: [{ id: 'a', children: [] }],
        }),
      ).toBe(true);

      expect(validatedNode.test({})).toBe(false);
    });
  });

  describe('eager API integration', () => {
    it('works when lazy is used inside an eager shape call', () => {
      const treeSchema: RuleInstance<any> = enforce.shape({
        value: enforce.isNumber(),
        children: enforce.isArrayOf(enforce.lazy(() => treeSchema)),
      });

      expect(() => {
        enforce({
          value: 1,
          children: [{ value: 2, children: [] }],
        }).shape(treeSchema.__schema);
      }).not.toThrow();
    });
  });

  describe('standalone lazy', () => {
    it('works as a standalone rule', () => {
      const numberRule = enforce.isNumber();
      const lazyNumber = enforce.lazy(() => numberRule);

      expect(lazyNumber.test(42)).toBe(true);
      // @ts-expect-error - testing runtime failure with invalid type
      expect(lazyNumber.test('not a number')).toBe(false);
    });
  });

  describe('error path propagation', () => {
    it('propagates error path through lazy boundary', () => {
      const schema: RuleInstance<any> = enforce.shape({
        name: enforce.isString(),
        children: enforce.isArrayOf(enforce.lazy(() => schema)),
      });

      const result = schema.run({
        name: 'root',
        children: [{ name: 123, children: [] }],
      });

      expect(result.pass).toBe(false);
      expect(result.path).toBeDefined();
    });
  });
});

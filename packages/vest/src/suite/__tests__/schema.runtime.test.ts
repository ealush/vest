import { describe, it, expect } from 'vitest';
import { enforce } from 'n4s';
import { create, test, only } from '../../vest';

describe('Schema Runtime Validation', () => {
  const schema = enforce.shape({
    name: enforce.isString(),
    age: enforce.isNumber(),
    tags: enforce.isArray(),
  });

  const suite = create((data = {}) => {
    test('name', 'Name must be present', () => {
      enforce(data.name).isNotBlank();
    });
  }, schema);

  it('should validate schema when no focus criteria is active', () => {
    // Valid data
    expect(suite.run({ name: 'John', age: 30, tags: [] }).isValid()).toBe(true);

    // Invalid data
    const result = suite.run({ name: 'John', age: '30' } as any);
    expect(result.hasErrors()).toBe(true);
    expect(result.hasErrors('age')).toBe(true);
  });

  it('should skip schema validation when "only" is active', () => {
    // Invalid data for schema (age is string), but we focus on 'name'
    // The schema validation should be skipped entirely
    const result = suite
      .focus({ only: 'name' })
      .run({ name: 'John', age: '30' } as any);

    expect(result.hasErrors('age')).toBe(false);
    expect(result.isValid()).toBe(true);
  });

  it('should skip schema validation when "only" is active via suite.focus().run()', () => {
    // Invalid data for schema
    const result = suite
      .focus({ only: ['name'] })
      .run({ name: 'John', age: '30' } as any);

    expect(result.hasErrors('age')).toBe(false);
    expect(result.isValid()).toBe(true);
  });

  describe('Extensive scenarios', () => {
    it('should handle partial data validation when not focused', () => {
      const partialSuite = create(
        () => {},
        enforce.shape({
          optional: enforce.optional(enforce.isString()),
        }),
      );

      expect(partialSuite.run({}).hasErrors()).toBe(false);
      expect(partialSuite.run({ optional: 123 } as any).hasErrors()).toBe(true);
    });

    it('should populate result.types with data', () => {
      const s = create(_data => {}, enforce.shape({ name: enforce.isString() }));
      const res = s.run({ name: 'Test' });

      expect(res.types).toHaveProperty('input', { name: 'Test' });
      expect(res.types).toHaveProperty('output', { name: 'Test' });
    });

    it('should fail if extra fields are present when using enforce.shape (strict)', () => {
      const strictSchema = enforce.shape({
        field: enforce.isString(),
      });
      const s = create(() => {}, strictSchema);
      expect(s.run({ field: 'yes', extra: 'no' } as any).hasErrors()).toBe(
        true,
      );
    });

    it('should pass if extra fields are present when using enforce.loose', () => {
      const looseSchema = enforce.loose({
        field: enforce.isString(),
      });
      const s = create(() => {}, looseSchema);
      expect(s.run({ field: 'yes', extra: 'no' } as any).hasErrors()).toBe(
        false,
      );
    });
  });

  describe('isArrayOf', () => {
    it('should fail with correct path when item at index fails', () => {
      const schema = enforce.shape({
        tags: enforce.isArrayOf(enforce.isString()),
      });

      const res = schema.run({
        tags: ['valid', 123, 'valid'],
      });

      expect(res.pass).toBe(false);
      expect(res.path).toEqual(['tags', '1']);
    });

    it('should fail with correct nested path when item at index fails nested validation', () => {
      const schema = enforce.shape({
        users: enforce.isArrayOf(
          enforce.shape({
            name: enforce.isString(),
            age: enforce.isNumber(),
          }),
        ),
      });

      const res = schema.run({
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: '25' }, // Invalid age
        ],
      });

      expect(res.pass).toBe(false);
      expect(res.path).toEqual(['users', '1', 'age']);
    });
  });

  describe('Stateful behavior', () => {
    it('should run schema validation only when not focused even if ran focused previously', () => {
      const schema = enforce.shape({
        required: enforce.isString(),
      });

      const suite = create(data => {
        test('field', () => {});
      }, schema);

      // First run: Focused
      // Schema validation should be skipped
      let res = suite.focus({ only: 'field' }).run({ required: 123 });

      expect(res.hasErrors()).toBe(false);
      expect(res.isValid()).toBe(true);

      // Second run: Not focused
      // Schema validation should run and fail
      res = suite.run({ required: 123 });
      expect(res.hasErrors()).toBe(true);
      expect(res.hasErrors('required')).toBe(true);
    });
  });
});

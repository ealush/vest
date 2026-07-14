import { describe, it, expect, vi } from 'vitest';
import { getStandardSchema } from '../getStandardSchema';

describe('getStandardSchema', () => {
  it('Should return the standard schema properties', () => {
    const schema = getStandardSchema(vi.fn());
    expect(schema).toHaveProperty('version', 1);
    expect(schema).toHaveProperty('vendor', 'vest');
    expect(schema).toHaveProperty('validate');
  });

  describe('validate', () => {
    it('Should return value on success', () => {
      const input = { a: 1 };
      const runner = vi.fn().mockReturnValue({
        hasErrors: () => false,
        value: input,
      });
      const schema = getStandardSchema(runner);

      const result = schema.validate(input);
      expect(result).toEqual({ value: input });
      expect(runner).toHaveBeenCalledWith(input);
    });

    it('Should return issues on failure', () => {
      const errors = [
        { message: 'error1', fieldName: 'field1' },
        { message: 'error2' }, // missing fieldName
      ];
      const runner = vi.fn().mockReturnValue({
        hasErrors: () => true,
        errors,
      });
      const schema = getStandardSchema(runner);

      const result = schema.validate({});
      // @ts-ignore
      expect(result.issues).toEqual([
        { message: 'error1', path: ['field1'] },
        { message: 'error2', path: undefined },
      ]);
    });

    it('Should keep issue message empty when no message exists', () => {
      const errors = [{ fieldName: 'field1' }];
      const runner = vi.fn().mockReturnValue({
        hasErrors: () => true,
        errors,
      });
      const schema = getStandardSchema(runner);

      const result = schema.validate({});
      // @ts-ignore
      expect(result.issues).toEqual([{ path: ['field1'] }]);
    });

    it('Should split nested field names', () => {
      const errors = [{ message: 'error1', fieldName: 'field1.nested' }];
      const runner = vi.fn().mockReturnValue({
        hasErrors: () => true,
        errors,
      });
      const schema = getStandardSchema(runner);

      // @ts-ignore
      const result = schema.validate({});
      // @ts-ignore
      expect(result.issues[0].path).toEqual(['field1', 'nested']);
    });
  });
});

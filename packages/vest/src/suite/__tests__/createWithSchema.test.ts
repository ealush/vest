import { enforce } from 'n4s';
import { describe, it, expect, vi } from 'vitest';

import { create } from 'vest';

describe('create accepts schema argument', () => {
  it('suite runs with schema as second argument', () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      age: enforce.isNumber(),
    });
    const callback = vi.fn();
    const suite = create(callback, schema);
    const data = { email: 'user@example.com', age: 32 };
    suite.run(data);
    expect(callback).toHaveBeenCalledWith(data);
  });

  it('suite runs without schema (backwards compatibility)', () => {
    const callback = vi.fn();
    const suite = create(callback);
    suite.run('anything', 123);
    expect(callback).toHaveBeenCalledWith('anything', 123);
  });

  it('suite runs with undefined schema', () => {
    const callback = vi.fn();
    const suite = create(callback, undefined);
    suite.run('test');
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('suite runs with null schema', () => {
    const callback = vi.fn();
    const suite = create(callback, null);
    suite.run('test');
    expect(callback).toHaveBeenCalledWith('test');
  });
});

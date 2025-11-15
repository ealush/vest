import { describe, it, expect, vi } from 'vitest';

import { enforce } from 'n4s';
import { create } from 'vest';

describe('createSuite with schema parameter', () => {
  it('passes typed data into the suite callback', () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      age: enforce.isNumber(),
    });

    const callback = vi.fn();
    const suite = create(callback, schema);

    const data = { email: 'user@example.com', age: 32 };
    suite.run(data);

    expect(callback).toHaveBeenCalledWith(data);
    expect(suite.get().types?.schema).toBe(schema);
  });

  it('exposes schema metadata on the suite result', () => {
    const schema = enforce.partial({
      nickname: enforce.isString(),
    });

    const suite = create(() => {}, schema);
    const result = suite.run({ nickname: 'vest' });

    expect(result.types?.schema).toBe(schema);
    expect(result.types?.data).toBeUndefined();
  });

  it('leaves types undefined when schema is omitted', () => {
    const suite = create(() => {});

    expect(suite.run().types).toBeUndefined();
  });
});

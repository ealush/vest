import { describe, expect, it } from 'vitest';

import {
  isSchemaExecutionProjection,
  withSchemaExecutionProjection,
} from '../projectionContext';

describe('schema execution projection context', () => {
  it('is scoped and nestable', () => {
    expect(isSchemaExecutionProjection()).toBe(false);
    withSchemaExecutionProjection(() => {
      expect(isSchemaExecutionProjection()).toBe(true);
      withSchemaExecutionProjection(() => {
        expect(isSchemaExecutionProjection()).toBe(true);
      });
      expect(isSchemaExecutionProjection()).toBe(true);
    });
    expect(isSchemaExecutionProjection()).toBe(false);
  });

  it('rejects asynchronous execution before it can silently lose context', () => {
    expect(() => withSchemaExecutionProjection(async () => {})).toThrow(
      'Schema execution projection must remain synchronous.',
    );
    expect(isSchemaExecutionProjection()).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

// Relative source imports pin both boundaries to the same n4s copy.
import { enforce } from '../../../../n4s/src/n4s';
import { EnforceSchemaError } from '../../../../n4s/src/errors/EnforceSchemaError';

import { create } from '../../vest';

function danglingRootSchema() {
  return enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.root.nope),
  });
}

function captureThrow(fn: () => void): unknown {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
}

describe('finalizer identity parity for dangling $.root paths', () => {
  it('standalone schema.test() throws a real EnforceSchemaError', () => {
    const schema = danglingRootSchema();
    const thrown = captureThrow(() => {
      schema.test({ a: 'a', b: 'b' });
    });

    expect(thrown).toBeInstanceOf(EnforceSchemaError);
    expect((thrown as Error).message).toBe(
      'EnforceSchemaError: "b" depends on unknown field "nope"',
    );
  });

  it('suite creation throws a real EnforceSchemaError with the identical message', () => {
    const schema = danglingRootSchema();
    const standaloneThrown = captureThrow(() => {
      schema.test({ a: 'a', b: 'b' });
    });
    expect(standaloneThrown).toBeInstanceOf(EnforceSchemaError);

    const suiteThrown = captureThrow(() => {
      create(() => {}, schema);
    });

    expect(suiteThrown).toBeInstanceOf(EnforceSchemaError);
    expect((suiteThrown as Error).constructor.name).toBe('EnforceSchemaError');
    expect((suiteThrown as Error).message).toBe(
      (standaloneThrown as Error).message,
    );
  });
});

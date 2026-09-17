import { describe, expect, it } from 'vitest';

import { compose, enforce } from '../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      runsDanglingBoundaryProbe: (value: { a: string; b: string }) => boolean;
    }
  }
}

describe('standalone boundary validation context', () => {
  it('enforces an independent schema evaluated inside a custom matcher', () => {
    const dangling = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.root.missing),
    });

    expect(() => dangling.test({ a: 'a', b: 'b' })).toThrowError(
      /"b" depends on unknown field "missing"/,
    );

    enforce.extend({
      runsDanglingBoundaryProbe: (value: { a: string; b: string }) =>
        dangling.test(value),
    });

    const outer = enforce.shape({
      pair: enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().runsDanglingBoundaryProbe(),
      }),
    });

    expect(() => outer.test({ pair: { a: 'a', b: 'b' } })).toThrowError(
      /"b" depends on unknown field "missing"/,
    );
  });

  it('keeps mounted fragments lenient until the final root', () => {
    const inner = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.accountType),
    });
    const outer = enforce.shape({
      accountType: enforce.isString(),
      company: inner,
    });

    expect(outer.test({ accountType: 'p', company: { taxId: 'x' } })).toBe(
      true,
    );
  });

  it('keeps a rooted fragment mounted through compose() lenient to the final root', () => {
    const inner = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.accountType),
    });
    const outer = enforce.shape({
      accountType: enforce.isString(),
      company: compose(inner),
    });

    expect(outer.test({ accountType: 'p', company: { taxId: 'x' } })).toBe(
      true,
    );
  });

  it('uses all structural children as the root of a standalone composition', () => {
    const dependent = enforce.loose({
      name: enforce.isString().dependsOn($ => $.root.id),
    });
    const provider = enforce.loose({ id: enforce.isString() });
    const composed = compose(dependent, provider);

    expect(composed.test({ id: '1', name: 'Ada' })).toBe(true);
    expect(composed.run({ id: '1', name: 'Ada' }).pass).toBe(true);

    const missingProvider = compose(
      dependent,
      enforce.loose({ other: enforce.isString() }),
    );
    expect(() =>
      missingProvider.test({ name: 'Ada', other: 'value' }),
    ).toThrowError(/"name" depends on unknown field "id"/);
  });

  it('still rejects a composed standalone fragment without its root provider', () => {
    const inner = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.accountType),
    });
    const wrapped = compose(inner);

    expect(() => wrapped.test({ taxId: 'x' })).toThrowError(
      /"taxId" depends on unknown field "accountType"/,
    );
  });

  it('still rejects a middle mount missing the provider', () => {
    const inner = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.accountType),
    });
    const middle = enforce.shape({
      company: inner,
      note: enforce.isString(),
    });

    expect(() =>
      middle.test({ company: { taxId: 'x' }, note: 'n' }),
    ).toThrowError(/"taxId" depends on unknown field "accountType"/);
  });

  it('resolves a rooted path through a composed provider schema', () => {
    const account = compose(
      enforce.shape({
        kind: enforce.isString(),
      }),
    );
    const child = enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root.account.kind),
    });
    const outer = enforce.shape({ account, child });

    expect(
      outer.test({
        account: { kind: 'business' },
        child: { taxId: '123' },
      }),
    ).toBe(true);
  });
});

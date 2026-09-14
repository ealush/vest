import { describe, expect, it, vi } from 'vitest';
import {
  EnforceSchemaError,
  FocusedSchemaMappingError,
  SchemaExclusionError,
  compose,
  enforce,
} from 'n4s';

import { create, mode, Modes, test } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      closureConditionalMapped: (value: string) => {
        pass: boolean;
        type: string;
      };
      closureBoomOnMapped: (value: string) => {
        pass: boolean;
        type: string;
      };
      closureFrameworkBoom: (value: string) => {
        pass: boolean;
        type: string;
      };
      closureReviewBoom: (value: string) => {
        pass: boolean;
        type: string;
      };
      closureReviewFlaky: (value: string) => {
        pass: boolean;
        type: string;
      };
    }
  }
}

const closureBoomError = new Error('closure parser boom');
enforce.extend(
  {
    closureConditionalMapped: (value: string) =>
      value === 'bad'
        ? { pass: false, type: 'MAPPED' }
        : { pass: true, type: value },
    closureBoomOnMapped: (value: string) => {
      if (value === 'MAPPED') throw closureBoomError;
      return { pass: true, type: value };
    },
    closureFrameworkBoom: (value: string) => {
      if (value === 'MAPPED') {
        throw new Error('closure mapping fault');
      }
      return { pass: true, type: value };
    },
  },
  {
    parsers: [
      'closureConditionalMapped',
      'closureBoomOnMapped',
      'closureFrameworkBoom',
    ],
  },
);

function deferred() {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}

const flush = () =>
  new Promise<void>(resolve => {
    setImmediate(resolve);
  });

// AS05b: pending async work plus a boundary throw, combined with every
// lifecycle owner (reset/remove/resetField/skip-while-pending). The invalid
// run must publish nothing; the lifecycle op owns cancellation; late
// settlement must not resurrect errors and the suite must stay usable.
describe('schema contracts: async lifecycle combined with boundary throws', () => {
  function boundarySuite() {
    const gate = deferred();
    const getterError = new Error('closure boundary boom');
    let armed = false;
    const callbacks: unknown[] = [];
    const suite = create(
      data => {
        callbacks.push(data);
        test('asy', async () => {
          await gate.promise;
        });
        test('other', () => true);
      },
      enforce.shape({
        payload: enforce.condition((value: unknown) => value !== null),
        other: enforce.isString(),
        asy: enforce.isString(),
      }),
    );
    const input: Record<string, unknown> = { other: 'ok', asy: 'ok' };
    Object.defineProperty(input, 'payload', {
      enumerable: true,
      get: () => {
        if (armed) throw getterError;
        return { nested: 1 };
      },
    });
    return {
      arm: (value: boolean) => {
        armed = value;
      },
      callbacks,
      gate,
      getterError,
      input,
      suite,
    };
  }

  it.each(['reset', 'remove', 'resetField'] as const)(
    '[SC-AS05b] %s after a boundary throw leaves no pending work and no publication',
    async operation => {
      const { arm, callbacks, gate, getterError, input, suite } =
        boundarySuite();
      const first = suite.run(input as never);
      expect(first.isPending()).toBe(true);

      arm(true);
      let thrown: unknown;
      try {
        suite
          .changed('other')
          .focus({ skip: 'payload' })
          .run(input as never);
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBe(getterError);
      expect(first.isPending()).toBe(true);
      expect(suite.get().isPending()).toBe(true);
      expect(callbacks).toHaveLength(1);

      if (operation === 'reset') suite.reset();
      else if (operation === 'remove') suite.remove('asy');
      else suite.resetField('asy');

      gate.release();
      await flush();
      await flush();
      expect(suite.get().isPending()).toBe(false);
      expect(suite.get().hasErrors('asy')).toBe(false);
      expect(callbacks).toHaveLength(1);

      if (operation === 'remove') {
        // Re-declaring a removed field on the next run is a vest order
        // violation by design; the post-remove contract is clean state with
        // the field gone and no late publication.
        expect(suite.get().tests.asy).toBeUndefined();
        return;
      }

      arm(false);
      const recovery = suite.run({
        other: 'next',
        asy: 'ok',
        payload: { nested: 2 },
      } as never);
      await flush();
      expect(recovery.hasErrors('asy')).toBe(false);
      gate.release();
      await flush();
    },
  );

  it('[SC-AS05b] skip-while-pending after a boundary throw settles without resurrecting the skipped field', async () => {
    const { arm, callbacks, gate, getterError, input, suite } = boundarySuite();
    const first = suite.run(input as never);
    expect(first.isPending()).toBe(true);

    arm(true);
    let thrown: unknown;
    try {
      suite
        .changed('other')
        .focus({ skip: 'payload' })
        .run(input as never);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(getterError);
    expect(callbacks).toHaveLength(1);

    arm(false);
    const focused = suite.focus({ skip: 'asy' }).run({
      other: 'ok',
      asy: 'ok',
      payload: { nested: 1 },
    } as never);
    expect(focused.hasErrors('asy')).toBe(false);
    gate.release();
    await flush();
    await flush();
    expect(suite.get().hasErrors('asy')).toBe(false);
    expect(suite.get().isPending()).toBe(false);
  });
});

// SE02: a skipped predicate with an observable throwing effect is never
// invoked through any composed-fallback route (public-suite complement of
// the n4s-level EX01 fallback pins).
describe('schema contracts: skipped-predicate zero invocation on fallback routes', () => {
  it('[SC-SE02] flat root-chain fallback never invokes a throwing skipped predicate', () => {
    const skipped = vi.fn(() => {
      throw new Error('excluded predicate executed');
    });
    const selected = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }),
      enforce.condition(() => true),
    );
    let thrown: unknown;
    try {
      create((_data: unknown) => {}, schema)
        .changed('b')
        .focus({ skip: 'a' })
        .run({ a: 'a', b: 'b' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('[SC-SE02] partial root-chain fallback never invokes a throwing skipped predicate', () => {
    const skipped = vi.fn(() => {
      throw new Error('excluded predicate executed');
    });
    const selected = vi.fn(() => true);
    const schema = compose(
      enforce.partial({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }) as never,
      enforce.condition(() => true) as never,
    );
    let thrown: unknown;
    try {
      create((_data: unknown) => {}, schema as never)
        .changed('b')
        .focus({ skip: 'a' })
        .run({ a: 'a', b: 'b' } as never);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('[SC-SE02] nested root-chain fallback never invokes a throwing skipped predicate', () => {
    const skipped = vi.fn(() => {
      throw new Error('excluded predicate executed');
    });
    const selected = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        profile: enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }),
      }),
      enforce.condition(() => true),
    );
    let thrown: unknown;
    try {
      create((_data: unknown) => {}, schema)
        .changed('profile.b')
        .focus({ skip: 'profile.a' })
        .run({ profile: { a: 'a', b: 'b' } });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeUndefined();
    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
  });
});

// DD02: two suites sharing one schema stay temporally isolated, and the
// shared n4s schema object carries no per-suite lifecycle state.
describe('schema contracts: two-suite isolation with shared-schema inspection', () => {
  it('[SC-DD02] shared schema isolates pending verdicts and keeps no per-suite state', async () => {
    const gate = deferred();
    const schema = enforce.shape({
      source: enforce.isString(),
      target: enforce.isString().dependsOn($ => $.source),
      note: enforce.isString(),
    });
    const before = Object.getOwnPropertyNames(schema as unknown as object);
    const make = () =>
      create((data: { source: string; target: string; note: string }) => {
        mode(Modes.ALL);
        test('source', () => {
          enforce(data.source).isNotBlank();
        });
        test('target', async () => {
          if (data.source === 'slow') await gate.promise;
          enforce(data.target).isNotBlank();
        });
        test('note', () => {
          enforce(data.note).isNotBlank();
        });
      }, schema);
    const slow = make();
    const fast = make();
    slow.changed('source').run({ source: 'slow', target: '', note: 'ok' });
    expect(slow.get().isPending()).toBe(true);

    const valid = await fast
      .changed('source')
      .run({ source: 'fast', target: 'filled', note: 'ok' });
    // A first-ever changed run leaves untouched fields untested, so validity
    // is read as absence of errors rather than full-suite validity.
    expect(valid.hasErrors()).toBe(false);
    expect(fast.get().hasErrors()).toBe(false);
    expect(fast.get().isPending()).toBe(false);
    expect(slow.get().isPending()).toBe(true);

    slow.reset();
    expect(slow.get().isPending()).toBe(false);
    expect(slow.get().hasErrors('target')).toBe(false);
    expect(fast.get().hasErrors()).toBe(false);
    gate.release();
    await flush();
    await flush();
    expect(slow.get().hasErrors('target')).toBe(false);
    expect(fast.get().hasErrors()).toBe(false);

    // The shared schema object itself accumulated no per-suite keys, and a
    // third suite over the same schema starts clean and validates fully.
    expect(Object.getOwnPropertyNames(schema as unknown as object)).toEqual(
      before,
    );
    const third = make();
    const thirdResult = await third.run({
      source: 'x',
      target: 'y',
      note: 'ok',
    });
    expect(thirdResult.isValid()).toBe(true);
    gate.release();
    await flush();
  });
});

// DD05: every projection/fallback route consumes the same semantic
// exclusions exactly once (C01 depth + dependent retention, C02 root scope,
// C03 fail-closed).
describe('schema contracts: single normalization across routes', () => {
  function fixture(composed: boolean) {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const root = vi.fn(() => true);
    const imperative: string[] = [];
    const inner = enforce.shape({
      a: enforce.condition(skipped),
      b: enforce.condition(selected),
    }) as never;
    const schema = composed
      ? (compose(inner, enforce.condition(root) as never) as never)
      : (inner as never);
    const build = () =>
      create(data => {
        mode(Modes.ALL);
        imperative.push('run');
        test('a', () => true);
        test('b', () => {
          void data;
          return true;
        });
      }, schema as never);
    return { build, imperative, root, selected, skipped };
  }

  it('[SC-DD05] changed/skip spellings, skip-only, and only agree on one execution set', () => {
    // Hard exclusions hold on every route including composed skip-only (R1:
    // the composed fallback reuses the omission walker). Inclusion (only),
    // composed or plain, keeps its explicit selection semantics: it narrows
    // reporting, not predicate execution, so composed only() still runs the
    // unselected validator exactly once.
    const observations: {
      errors: boolean;
      root: number;
      route: string;
      selected: number;
      skipped: number;
    }[] = [];
    {
      const routes = [
        'changed-then-skip',
        'skip-then-changed',
        'skip-only',
        'only',
      ] as const;
      for (const route of routes) {
        const { build, root, selected, skipped } = fixture(false);
        const suite = build();
        let result;
        if (route === 'changed-then-skip')
          result = suite
            .changed('b')
            .focus({ skip: 'a' })
            .run({ a: 'a', b: 'b' } as never);
        else if (route === 'skip-then-changed')
          result = suite
            .focus({ skip: 'a' })
            .changed('b')
            .run({ a: 'a', b: 'b' } as never);
        else if (route === 'skip-only')
          result = suite.focus({ skip: 'a' }).run({ a: 'a', b: 'b' } as never);
        else result = suite.only('b').run({ a: 'a', b: 'b' } as never);
        observations.push({
          errors: result.hasErrors(),
          root: root.mock.calls.length,
          route: `plain/${route}`,
          selected: selected.mock.calls.length,
          skipped: skipped.mock.calls.length,
        });
      }
    }
    for (const route of [
      'changed-then-skip',
      'skip-then-changed',
      'skip-only',
    ] as const) {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const root = vi.fn(() => true);
      const schema = compose(
        enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }) as never,
        enforce.condition(root) as never,
      );
      const suite = create((_data: unknown) => {}, schema as never);
      const data = { a: 'a', b: 'b' } as never;
      let errors: boolean;
      if (route === 'changed-then-skip')
        errors = (
          suite.changed('b').focus({ skip: 'a' }).run(data) as {
            hasErrors(): boolean;
          }
        ).hasErrors();
      else if (route === 'skip-then-changed')
        errors = (
          suite.focus({ skip: 'a' }).changed('b').run(data) as {
            hasErrors(): boolean;
          }
        ).hasErrors();
      else
        errors = (
          suite.focus({ skip: 'a' }).run(data) as { hasErrors(): boolean }
        ).hasErrors();
      observations.push({
        errors,
        root: root.mock.calls.length,
        route: `composed/${route}`,
        selected: selected.mock.calls.length,
        skipped: skipped.mock.calls.length,
      });
    }
    for (const observation of observations) {
      expect({
        route: observation.route,
        skipped: observation.skipped,
      }).toEqual({ route: observation.route, skipped: 0 });
      expect(observation.selected).toBe(1);
      expect(observation.errors).toBe(false);
    }
    // C02: a root predicate remains a root predicate on every composed route
    // (plain-schema routes carry no root by construction).
    const composedRoots = observations
      .filter(o => o.route.startsWith('composed/'))
      .map(o => o.root);
    expect(new Set(composedRoots)).toEqual(new Set([1]));
  });

  it('[SC-DD05] composed only() keeps inclusion semantics and runs unselected once', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }) as never,
      enforce.condition(() => true) as never,
    );
    const result = create((_data: unknown) => {}, schema as never)
      .only('b')
      .run({ a: 'a', b: 'b' } as never);
    // Inclusion narrows reporting, not predicate execution: documented
    // contrast with hard skip exclusions, which never execute.
    expect(skipped).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-DD05] a skip clears the retained verdict without running the field', () => {
    for (const route of ['changed-then-skip', 'skip-only'] as const) {
      const skipped = vi.fn(() => true);
      const schema = enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.isString(),
      });
      const suite = create((_data: unknown) => {}, schema as never);
      expect(suite.run({ a: 'a', b: 'ok' } as never).hasErrors()).toBe(false);
      skipped.mockClear();
      const data = { a: 'a', b: 'next' } as never;
      const result =
        route === 'changed-then-skip'
          ? suite.changed('b').focus({ skip: 'a' }).run(data)
          : suite.focus({ skip: 'a' }).run(data);
      expect(skipped).not.toHaveBeenCalled();
      expect(result.hasErrors('a')).toBe(false);
    }
  });

  it('[SC-DD05] nested skip depth is honored identically on every route', () => {
    // Bare skip-only full runs at nested depth execute the excluded child
    // once (same EX03 extended-interactions family as the composed bare-skip
    // route); depth parity here covers both changed/skip orders, which carry
    // the exact exclusion through the fallback.
    const routes = ['changed-then-skip', 'skip-then-changed'] as const;
    for (const route of routes) {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const schema = enforce.shape({
        profile: enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }),
      });
      const suite = create((_data: unknown) => {}, schema as never);
      const data = { profile: { a: 'a', b: 'b' } } as never;
      if (route === 'changed-then-skip')
        suite.changed('profile.b').focus({ skip: 'profile.a' }).run(data);
      else if (route === 'skip-then-changed')
        suite.focus({ skip: 'profile.a' }).changed('profile.b').run(data);
      else suite.focus({ skip: 'profile.a' }).run(data);
      expect({ route, calls: skipped.mock.calls.length }).toEqual({
        route,
        calls: 0,
      });
      expect(selected).toHaveBeenCalledTimes(1);
    }
  });

  it('[SC-DD05] opaque moved-chain skip fails closed before excluded work on every route', () => {
    const routes = ['changed-then-skip', 'skip-then-changed'] as const;
    for (const route of routes) {
      const skipped = vi.fn(() => true);
      const moved = (
        enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.isString(),
        }) as unknown as { message(m: string): unknown }
      ).message('moved container');
      const suite = create(
        (_data: unknown) => {},
        moved as never,
      ) as unknown as {
        changed(field: string): {
          focus(modifiers: { skip: string }): { run(data: unknown): unknown };
        };
        focus(modifiers: { skip: string }): {
          changed(field: string): { run(data: unknown): unknown };
        };
      };
      let thrown: unknown;
      try {
        if (route === 'changed-then-skip')
          suite.changed('b').focus({ skip: 'a' }).run({ a: 'a', b: 'b' });
        else suite.focus({ skip: 'a' }).changed('b').run({ a: 'a', b: 'b' });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(SchemaExclusionError);
      expect((thrown as SchemaExclusionError).code).toBe(
        'SCHEMA_EXCLUSION_UNSUPPORTED',
      );
      expect(skipped).not.toHaveBeenCalled();
    }
  });
});

// DD06: unsupported projection, validation failure, and unexpected execution
// exceptions stay distinguished on every route (C03/C11 boundary; mapping
// and execution faults of any class propagate with single execution,
// structural gaps route via planning before user execution).
describe('schema contracts: error boundaries per route', () => {
  function throwingParserSuite() {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.closureConditionalMapped().closureBoomOnMapped(),
        b: enforce.isString(),
      }),
    );
    return { callback, suite };
  }

  function frameworkFaultSuite() {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.closureConditionalMapped().closureFrameworkBoom(),
        b: enforce.isString(),
      }),
    );
    return { callback, suite };
  }

  it.each(['full', 'changed', 'changed-skip'] as const)(
    '[SC-DD06] unexpected parser exception propagates with identity on route %s',
    route => {
      const { callback, suite } = throwingParserSuite();
      const valid = suite.run({ a: 'good', b: 'ok' });
      expect(valid.isValid()).toBe(true);
      expect(callback).toHaveBeenCalledTimes(1);
      let thrown: unknown;
      try {
        if (route === 'full') suite.run({ a: 'bad', b: 'ok' });
        else if (route === 'changed')
          suite.changed('a').run({ a: 'bad', b: 'ok' });
        else suite.changed('b').focus({ skip: 'a' }).run({ a: 'bad', b: 'ok' });
      } catch (error) {
        thrown = error;
      }
      // Failure mapping reaches the throwing stage on every route: the
      // original cause propagates, no fabricated mapping is published.
      expect(thrown).toBe(closureBoomError);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(suite.get().hasErrors()).toBe(false);
      const recovery = suite.run({ a: 'fine', b: 'ok' });
      expect(recovery.isValid()).toBe(true);
    },
  );

  it.each(['full', 'changed'] as const)(
    '[SC-DD06] mapping-stage fault propagates with identity on route %s',
    route => {
      const { callback, suite } = frameworkFaultSuite();
      // A full run first: it establishes the branch witness a first-ever
      // focused run cannot provide on its own.
      const valid = suite.run({ a: 'good', b: 'ok' });
      expect(valid.isValid()).toBe(true);
      // No framework-owned mapping fallback exists: the fault propagates
      // by identity with no fabricated callback input.
      let thrown: unknown;
      try {
        if (route === 'full') suite.run({ a: 'bad', b: 'ok' });
        else suite.changed('a').run({ a: 'bad', b: 'ok' });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).message).toBe('closure mapping fault');
      expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  // R1: composed skip-only must observe hard exclusions. Fails red until
  // the composed fallback route applies omission before execution.
  it('[SC-R1] composed skip-only never executes the excluded validator', () => {
    const excluded = vi.fn(() => true);
    const root = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        a: enforce.condition(excluded),
        b: enforce.isString(),
      }),
      enforce.condition(root),
    );
    const callback = vi.fn();
    const suite = create((_data: unknown) => {
      callback((_data as unknown[])[0]);
      test('a', () => true);
      test('b', () => true);
    }, schema);
    const result = suite.focus({ skip: 'a' }).run({ a: 'a', b: 'b' });
    expect(excluded).not.toHaveBeenCalled();
    expect(root).toHaveBeenCalledTimes(1);
    expect(result.hasErrors('a')).toBe(false);
  });

  // R1: nested composed skip-only keeps the same hard-exclusion contract.
  it('[SC-R1] nested composed skip-only never executes the excluded validator', () => {
    const excluded = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        profile: enforce.shape({
          a: enforce.condition(excluded),
          b: enforce.isString(),
        }),
      }),
      enforce.condition(() => true),
    );
    create((_data: unknown) => {}, schema)
      .focus({ skip: 'profile.a' })
      .run({ profile: { a: 'a', b: 'b' } });
    expect(excluded).not.toHaveBeenCalled();
  });

  // R2: reusable fault injector — always-throwing user parser, mirroring
  // the public-API reproduction (parser stage throws EnforceSchemaError).
  const reviewFault = new EnforceSchemaError('user parser fault');
  let reviewCalls = 0;
  const reviewUnrelated = vi.fn(() => true);
  enforce.extend(
    {
      closureReviewBoom: () => {
        reviewCalls += 1;
        throw reviewFault;
      },
      closureReviewFlaky: (() => {
        let calls = 0;
        return () => {
          calls += 1;
          if (calls === 1) throw reviewFault;
          return { pass: true, type: 'recovered' };
        };
      })(),
    },
    { parsers: ['closureReviewBoom', 'closureReviewFlaky'] },
  );

  function reviewSuite(parser: 'closureReviewBoom' | 'closureReviewFlaky') {
    const callback = vi.fn();
    reviewUnrelated.mockClear();
    const suite = create(
      (_data: unknown) => {
        callback((_data as unknown[])[0]);
        test('b', () => true);
      },
      enforce.shape({
        a:
          parser === 'closureReviewBoom'
            ? enforce.closureReviewBoom()
            : enforce.closureReviewFlaky(),
        b: enforce.condition(reviewUnrelated),
      }),
    );
    return { callback, suite };
  }

  // R2: an unexpected user exception attempts user execution exactly once
  // and propagates by identity with no callback or alternate route.
  it('[SC-R2] always-throwing user fault executes once and propagates', () => {
    reviewCalls = 0;
    const { callback, suite } = reviewSuite('closureReviewBoom');
    let thrown: unknown;
    try {
      suite.changed('a').run({ a: 'x', b: 'ok' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(reviewFault);
    expect(reviewCalls).toBe(1);
    expect(reviewUnrelated).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  // R2: throw-first injector still surfaces the original sentinel without
  // fallback, unrelated predicates, or callbacks.
  it('[SC-R2] throw-first user fault surfaces the original without fallback', () => {
    const { callback, suite } = reviewSuite('closureReviewFlaky');
    let thrown: unknown;
    try {
      suite.changed('a').run({ a: 'x', b: 'ok' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(reviewFault);
    expect(reviewUnrelated).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it.each(['full', 'changed'] as const)(
    '[SC-DD06] unwitnessed union fails closed with a stable code on route %s',
    route => {
      const callback = vi.fn();
      const suite = create(
        data => {
          callback(data);
          test('b', () => true);
        },
        enforce.shape({
          a: enforce.isArrayOf(
            enforce.isNumeric().toNumber(),
            enforce.isBoolean(),
          ),
          b: enforce.isString(),
        }),
      );
      let thrown: unknown;
      try {
        if (route === 'full')
          suite.focus({ skip: 'a' }).run({ a: ['2'], b: 'ok' } as never);
        else suite.changed('b').run({ a: ['2'], b: 'ok' } as never);
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(FocusedSchemaMappingError);
      expect((thrown as FocusedSchemaMappingError).code).toBe(
        'FOCUSED_SCHEMA_MAPPING_UNWITNESSED_UNION',
      );
      expect(callback).not.toHaveBeenCalled();
    },
  );
});

// SE02-hostile: hostile keys, inherited/non-enumerable/dotted/numeric keys,
// and malformed selectors never pollute prototypes, never mutate inherited
// state, and never attribute errors across fields. Outer-API complement to
// the SE02 zero-invocation pins above.
describe('schema contracts: hostile keys and selectors (SE02)', () => {
  function hostileSuite() {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    });
    const calls: string[] = [];
    const suite = create((_data: unknown) => {
      test('a', () => {
        calls.push('a');
        return true;
      });
      test('b', () => {
        calls.push('b');
        return true;
      });
    }, schema);
    return { calls, suite };
  }

  it('[SC-SE02-HOSTILE] __proto__/constructor/prototype input keys cause no pollution', () => {
    const { suite } = hostileSuite();
    const hostile = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":{"polluted":true},"prototype":{"polluted":true},"a":"x","b":"y"}',
    );
    const result = suite.run(hostile);
    // Strict shapes reject the hostile extra keys at the top level, but
    // the failure is never attributed to the honest fields and nothing
    // is written into Object.prototype.
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('b')).toBe(false);
    expect((Object.prototype as Record<string, unknown>).polluted).toBe(
      undefined,
    );
    expect({}.hasOwnProperty('polluted')).toBe(false);
    expect(Object.prototype.hasOwnProperty('polluted')).toBe(false);
    // The payload's own hostile keys did not become suite fields.
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('b')).toBe(false);
  });

  it('[SC-SE02-HOSTILE] inherited keys are not treated as own values and prototypes stay intact', () => {
    const { suite } = hostileSuite();
    const proto = { a: 'inherited' };
    const input = Object.create(proto);
    input.b = 'y';
    const result = suite.run(input as never);
    // Inherited `a` does not satisfy the own-value requirement.
    expect(result.hasErrors('a')).toBe(true);
    expect(result.hasErrors('b')).toBe(false);
    expect(proto).toEqual({ a: 'inherited' });
    expect(Object.getPrototypeOf(input)).toBe(proto);
    expect((Object.prototype as Record<string, unknown>).polluted).toBe(
      undefined,
    );
  });

  it('[SC-SE02-HOSTILE] numeric/dotted record keys do not conflate or cross-attribute', () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
      },
      enforce.shape({
        dict: enforce.record(enforce.isString().isNotBlank()),
        note: enforce.isString(),
      }) as never,
    );
    // Dotted and numeric-like keys stay distinct own properties.
    const data = {
      dict: { '1': 'ok', '01': '', 'a.b': 'ok' },
      note: 'ok',
    };
    const result = suite.run(data as never);
    expect(result.hasErrors()).toBe(true);
    expect(Object.hasOwn(data.dict as object, '1')).toBe(true);
    expect(Object.hasOwn(data.dict as object, '01')).toBe(true);
    expect(Object.hasOwn(data.dict as object, 'a.b')).toBe(true);
    expect((Object.prototype as Record<string, unknown>).polluted).toBe(
      undefined,
    );
  });

  it('[SC-SE02-HOSTILE] non-enumerable keys and malformed selectors stay inert', () => {
    const { calls, suite } = hostileSuite();
    const input: Record<string, unknown> = { a: 'x', b: 'y' };
    Object.defineProperty(input, '__proto__pollutant', {
      enumerable: false,
      value: 'hidden',
    });
    expect(suite.run(input as never).hasErrors()).toBe(false);

    for (const selector of [
      '__proto__',
      'constructor',
      'prototype',
      'a..b',
      'nope.missing',
    ]) {
      calls.length = 0;
      let thrown: unknown;
      let result: { hasErrors(): boolean } | undefined;
      try {
        result = suite.changed(selector).run({ a: 'x', b: 'y' }) as {
          hasErrors(): boolean;
        };
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeUndefined();
      expect(result?.hasErrors()).toBe(false);
      expect(calls).toEqual([]);
    }
    expect((Object.prototype as Record<string, unknown>).polluted).toBe(
      undefined,
    );
  });
});

// T5-async: rejection (not just resolution-failure) variants. A rejecting
// pending test settles as a field error; reset/remove/resetField while
// pending prevent resurrection; two pending fields with one reset keep the
// untouched pending work live.
describe('schema contracts: async rejection lifecycle (T5)', () => {
  const schema = enforce.shape({
    p: enforce.shape({
      source: enforce.isString(),
      target: enforce.isString().dependsOn($ => $.source),
    }),
    other: enforce.isString(),
  });

  // Dynamic field names cannot satisfy create()'s literal field vocabulary;
  // the contracts under test are runtime lifecycle behavior.
  type LooseSuite = any;

  function rejectingSuite(): {
    boom: Error;
    gate: Promise<void>;
    reject: (error: unknown) => void;
    suite: LooseSuite;
  } {
    let reject!: (error: unknown) => void;
    const gate = new Promise<void>((_resolve, rejectPromise) => {
      reject = rejectPromise;
    });
    const boom = new Error('async rejection boom');
    const suite: LooseSuite = create(() => {
      test('p.target', async () => {
        await gate;
      });
    }, schema);
    return { boom, gate, reject, suite };
  }

  it.each(['reset', 'remove', 'resetField'] as const)(
    '[SC-T5] %s after a pending rejection prevents resurrection',
    async operation => {
      const { boom, reject, suite } = rejectingSuite();
      suite.run({ p: { source: 'same', target: 'x' }, other: 'ok' });
      expect(suite.get().isPending()).toBe(true);
      if (operation === 'reset') suite.reset();
      else if (operation === 'remove') suite.remove('p.target');
      else suite.resetField('p.target');
      reject(boom);
      await flush();
      await flush();
      expect(suite.get().isPending()).toBe(false);
      expect(suite.get().hasErrors('p.target')).toBe(false);
      if (operation === 'remove') {
        expect(suite.get().tests['p.target']).toBeUndefined();
      }
    },
  );

  it('[SC-T5] two pending rejections with one reset keep the untouched field live', async () => {
    let rejectA!: (error: unknown) => void;
    let rejectB!: (error: unknown) => void;
    const gateA = new Promise<void>((_resolve, rejectPromise) => {
      rejectA = rejectPromise;
    });
    const gateB = new Promise<void>((_resolve, rejectPromise) => {
      rejectB = rejectPromise;
    });
    const suite: LooseSuite = create(() => {
      test('p.target', async () => {
        await gateA;
      });
      test('other', async () => {
        await gateB;
      });
    }, schema);
    suite.run({ p: { source: 's', target: 'x' }, other: 'ok' });
    expect(suite.get().isPending()).toBe(true);

    suite.resetField('p.target');
    rejectA(new Error('stale A'));
    rejectB(new Error('live B'));
    await flush();
    await flush();

    expect(suite.get().isPending()).toBe(false);
    // The reset field stays cleared; the untouched pending rejection
    // settles as its own field error with no cross-field attribution.
    expect(suite.get().hasErrors('p.target')).toBe(false);
    expect(suite.get().hasErrors('other')).toBe(true);
  });
});

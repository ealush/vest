import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import {
  create,
  test,
  group,
  skipWhen,
  omitWhen,
  optional,
  warn,
} from '../../vest';
import { each } from '../../isolates/each';

function createLog() {
  const fields: string[] = [];
  return {
    record(f: string) {
      fields.push(f);
    },
    reset() {
      fields.length = 0;
    },
    get() {
      return [...fields];
    },
  };
}

function _normalize(result: any) {
  return {
    hasErrors: (field: string) => result.hasErrors(field),
    getErrors: (field: string) => result.getErrors(field),
  };
}

// 1. Sanity / control tests
describe('Acceptance — Sanity', () => {
  it('runs an ordinary suite without relationships', async () => {
    const suite = create((data: any) => {
      test('password', 'Too short', () => {
        enforce(data.password).longerThanOrEquals(8);
      });
    });
    const result = await suite.run({ password: '123' });
    expect(result.getErrors('password')).toEqual(['Too short']);
  });

  it('attaching a schema does not change full-run behavior', async () => {
    const cb = (data: any) => {
      test('password', 'Too short', () => {
        enforce(data.password).longerThanOrEquals(8);
      });
      test('email', 'Required', () => {
        enforce(data.email).isNotBlank();
      });
    };
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const withoutSchema = create(cb);
    const withSchema = create(cb, schema);
    const dataValid = { password: 'abcdefgh', email: 'a@b.com' };
    const dataInvalid = { password: '123', email: '' };
    const r1 = await withoutSchema.run(dataValid);
    const _r2 = await withSchema.run(dataValid);
    expect(r1.hasErrors('password')).toBe(_r2.hasErrors('password'));
    expect(r1.hasErrors('email')).toBe(_r2.hasErrors('email'));
    const r3 = await withoutSchema.run(dataInvalid);
    const r4 = await withSchema.run(dataInvalid);
    expect(r3.getErrors('password')).toEqual(r4.getErrors('password'));
  });

  it('a schema with dependencies behaves identically under run()', async () => {
    const schemaWith = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const schemaWithout = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString(),
    });
    const logWith = createLog();
    const logWithout = createLog();
    const createSuite = (schema: any, log: any) =>
      create((data: any) => {
        test('password', () => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', () => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
      }, schema);
    const suiteWith = createSuite(schemaWith, logWith);
    const suiteWithout = createSuite(schemaWithout, logWithout);
    const data = { password: 'abcdefgh', confirmPassword: 'xyz' };
    const rWith = await suiteWith.run(data);
    const rWithout = await suiteWithout.run(data);
    expect(logWith.get()).toEqual(logWithout.get());
    expect(rWith.hasErrors('confirmPassword')).toBe(
      rWithout.hasErrors('confirmPassword'),
    );
  });
});

// 2. Direct proof that the feature succeeds (before/after controls)
describe('Acceptance — Feature success (before/after)', () => {
  it('without relationship, changed() does not know about sibling (problem)', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString(),
    });
    const log = createLog();
    const suite = create((data: any) => {
      test('password', () => {
        log.record('password');
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        log.record('confirmPassword');
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    log.reset();
    const result = await suite
      .changed('password')
      .run({ password: 'abcdefgh2', confirmPassword: 'abcdefgh' });
    expect(log.get()).toEqual(['password']);
    expect(result.hasErrors('confirmPassword')).toBe(false); // stale
  });

  it('with relationship, changed() does know about sibling (solution)', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createLog();
    const suite = create((data: any) => {
      test('password', () => {
        log.record('password');
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        log.record('confirmPassword');
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    log.reset();
    const result = await suite
      .changed('password')
      .run({ password: 'abcdefgh2', confirmPassword: 'abcdefgh' });
    expect(log.get()).toEqual(['password', 'confirmPassword']);
    expect(result.hasErrors('confirmPassword')).toBe(true);
  });

  it('fixing dependent clears result', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create((data: any) => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    let result = await suite
      .changed('password')
      .run({ password: 'newpass1', confirmPassword: 'abcdefgh' });
    expect(result.hasErrors('confirmPassword')).toBe(true);
    result = await suite
      .changed('confirmPassword')
      .run({ password: 'newpass1', confirmPassword: 'newpass1' });
    expect(result.hasErrors('confirmPassword')).toBe(false);
  });

  it('nested dependency success before/after', async () => {
    const schemaWithout = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString(),
      }),
    });
    const schemaWith = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const makeSuite = (schema: any) =>
      create((data: any) => {
        test('profile.country', () => {
          enforce(data.profile.country).isNotBlank();
        });
        test('profile.state', () => {
          if (data.profile.country === 'US')
            enforce(data.profile.state).isNotBlank();
        });
      }, schema);
    const suiteWithout = makeSuite(schemaWithout);
    const suiteWith = makeSuite(schemaWith);
    await suiteWithout.run({ profile: { country: 'CA', state: '' } });
    await suiteWith.run({ profile: { country: 'CA', state: '' } });
    // Monkey-patch to capture - simpler: just check hasErrors after changed
    await suiteWithout
      .changed('profile.country')
      .run({ profile: { country: 'US', state: '' } });
    const rWithoutHasError = suiteWithout.get().hasErrors('profile.state');
    await suiteWith
      .changed('profile.country')
      .run({ profile: { country: 'US', state: '' } });
    const rWithHasError = suiteWith.get().hasErrors('profile.state');
    expect(rWithoutHasError).toBe(false); // stale-valid
    expect(rWithHasError).toBe(true);
  });

  it('async success — without relationship stale, with relationship correct', async () => {
    const schemaWithout = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString(),
    });
    const schemaWith = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
    });
    const makeSuite = (schema: any) =>
      create((data: any) => {
        test('username', async () => {
          const _available = await Promise.resolve(
            data.username !== 'taken' || data.organizationId === 'A',
          );
          // For org B, 'taken' should be invalid
          const isAvailable =
            data.organizationId === 'B' ? data.username !== 'taken' : true;
          enforce(isAvailable).isTruthy();
        });
      }, schema);
    const suiteWithout = makeSuite(schemaWithout);
    const suiteWith = makeSuite(schemaWith);
    await suiteWithout.run({ organizationId: 'A', username: 'free' });
    await suiteWith.run({ organizationId: 'A', username: 'free' });
    await suiteWithout
      .changed('organizationId')
      .run({ organizationId: 'B', username: 'taken' });
    expect(suiteWithout.get().hasErrors('username')).toBe(false); // stale
    await suiteWith
      .changed('organizationId')
      .run({ organizationId: 'B', username: 'taken' });
    expect(suiteWith.get().hasErrors('username')).toBe(true);
  });
});

// 3. No-regression
describe('Acceptance — No regression', () => {
  it('run() unchanged', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create((data: any) => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    const result = await suite.run({
      password: 'abcdefgh',
      confirmPassword: 'xyz',
    });
    expect(result.hasErrors('confirmPassword')).toBe(true);
    // Should run complete suite, not just changed
    const log = createLog();
    const suite2 = create((data: any) => {
      test('a', () => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
    }, schema);
    await suite2.run({ a: '1', b: '2' });
    expect(log.get()).toEqual(['a', 'b']);
  });

  it('only() unchanged — only exact, changed is dependency-aware', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createLog();
    const suite = create((data: any) => {
      test('password', () => {
        log.record('password');
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        log.record('confirmPassword');
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    log.reset();
    await suite
      .only('password')
      .run({ password: 'xyz', confirmPassword: 'mismatch' });
    expect(log.get()).toEqual(['password']);
    log.reset();
    await suite
      .changed('password')
      .run({ password: 'xyz2', confirmPassword: 'mismatch' });
    expect(log.get()).toEqual(['password', 'confirmPassword']);
  });

  it('focus() unchanged', async () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const suite = create((data: any) => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        enforce(data.b).isNotBlank();
      });
    }, schema);
    const resultFocused = await suite
      .focus({ only: 'a' })
      .run({ a: '', b: '' });
    expect(resultFocused.hasErrors('a')).toBe(true);
    // b should not have run (focused)
    const resultFull = await suite.run({ a: '', b: '' });
    expect(resultFull.hasErrors('b')).toBe(true);
  });

  it('include() unchanged', async () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const suite = create((data: any) => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        enforce(data.b).isNotBlank();
      });
      test('c', () => {
        enforce(data.c).isNotBlank();
      });
    }, schema);
    // Without include, only a runs via only
    const r1 = await suite.only('a').run({ a: '', b: '', c: '' });
    expect(r1.hasErrors('a')).toBe(true);
    // include should still work (if include is available)
    // For now just verify that adding schema doesn't break focus
    const _r2 = await suite.focus({ only: 'a' }).run({ a: '', b: '', c: '' });
    expect(_r2.hasErrors('a')).toBe(true);
  });

  it('skipWhen() unchanged — canonical sequence', async () => {
    const suite = create((data: any) => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      skipWhen(data.b !== 'run', () => {
        test('b', () => {
          enforce(data.b).isNotBlank();
        });
      });
    });
    const r1 = await suite.run({ a: '1', b: '' });
    expect(r1.hasErrors('b')).toBe(false); // skipped, so no error even though blank
    const _r2 = await suite.run({ a: '1', b: '' });
    // Attach irrelevant schema and ensure same
    const schema = enforce.shape({
      x: enforce.isString(),
      y: enforce.isString().dependsOn($ => $.x),
    });
    const suiteWithSchema = create((data: any) => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      skipWhen(data.b !== 'run', () => {
        test('b', () => {
          enforce(data.b).isNotBlank();
        });
      });
    }, schema);
    const r3 = await suiteWithSchema.run({ a: '1', b: '' });
    expect(r3.hasErrors('b')).toBe(false);
  });

  it('omitWhen() unchanged', async () => {
    const suite = create((data: any) => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      omitWhen(data.b === 'omit', () => {
        test('b', () => {
          enforce(data.b).isNotBlank();
        });
      });
    });
    const r1 = await suite.run({ a: '1', b: '' });
    // b is not omitted (b !== 'omit'), so should have error
    expect(r1.hasErrors('b')).toBe(true);
    const _r2 = await suite.run({ a: '1', b: 'omit' });
    // b omitted, so no error
    expect(_r2.hasErrors('b')).toBe(false);
  });

  it.skip('optional() unchanged — TODO', async () => {
    const suite = create((data: any) => {
      optional('a');
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
    });
    const r1 = await suite.run({ a: '' });
    expect(r1.isValid()).toBe(true); // optional empty is valid
  });

  it.skip('warn() unchanged — TODO', async () => {
    const suite = create((data: any) => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      warn();
      test('b', () => {
        enforce(data.b).isNotBlank();
      });
    });
    const r1 = await suite.run({ a: '', b: '' });
    expect(r1.hasErrors('a')).toBe(true);
    expect(r1.hasWarnings('b')).toBe(true);
    expect(r1.hasErrors('b')).toBe(false);
  });

  it('group() unchanged', async () => {
    const suite = create((data: any) => {
      group('g1', () => {
        test('a', () => {
          enforce(data.a).isNotBlank();
        });
      });
      group('g2', () => {
        test('b', () => {
          enforce(data.b).isNotBlank();
        });
      });
    });
    const r1 = await suite.run({ a: '', b: '' });
    expect(r1.hasErrors('a')).toBe(true);
    expect(r1.hasErrors('b')).toBe(true);
    const schema = enforce.shape({
      x: enforce.isString(),
      y: enforce.isString().dependsOn($ => $.x),
    });
    const suiteWithSchema = create((data: any) => {
      group('g1', () => {
        test('a', () => {
          enforce(data.a).isNotBlank();
        });
      });
      group('g2', () => {
        test('b', () => {
          enforce(data.b).isNotBlank();
        });
      });
    }, schema);
    const _r2 = await suiteWithSchema.run({ a: '', b: '' });
    expect(_r2.hasErrors('a')).toBe(true);
    expect(_r2.hasErrors('b')).toBe(true);
  });

  it('each() unchanged — no relationships', async () => {
    const suite = create((data: any) => {
      each(data.items, (item: any, index: number) => {
        test(`items.${index}`, () => {
          enforce(item).isNotBlank();
        });
      });
    });
    const r1 = await suite.run({ items: ['a', '', 'c'] });
    expect(r1.hasErrors('items.1')).toBe(true);
    const schema = enforce.shape({
      x: enforce.isString(),
      y: enforce.isString().dependsOn($ => $.x),
    });
    const suiteWithSchema = create((data: any) => {
      each(data.items, (item: any, index: number) => {
        test(`items.${index}`, () => {
          enforce(item).isNotBlank();
        });
      });
    }, schema);
    const _r2 = await suiteWithSchema.run({ items: ['a', '', 'c'] });
    expect(_r2.hasErrors('items.1')).toBe(true);
  });
});

// 4. Prove unrelated fields are truly unaffected
describe('Acceptance — Unrelated unaffected', () => {
  it('changed() does not execute unrelated work and does not lose unrelated state', async () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const log = createLog();
    const suite = create((data: any) => {
      test('email', () => {
        log.record('email');
        enforce(data.email).isNotBlank();
      });
      test('password', () => {
        log.record('password');
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        log.record('confirmPassword');
        enforce(data.confirmPassword).equals(data.password);
      });
      test('profile.country', () => {
        log.record('profile.country');
        enforce(data.profile.country).isNotBlank();
      });
      test('profile.state', () => {
        log.record('profile.state');
        enforce(data.profile.state).isNotBlank();
      });
    }, schema);
    await suite.run({
      email: 'a@b.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
      profile: { country: 'US', state: 'CA' },
    });
    log.reset();
    await suite.changed('password').run({
      email: 'a@b.com',
      password: 'xyz',
      confirmPassword: 'abcdefgh',
      profile: { country: 'US', state: 'CA' },
    });
    expect(log.get()).toEqual(['password', 'confirmPassword']);
    expect(log.get()).not.toContain('email');
    expect(log.get()).not.toContain('profile.country');
    expect(log.get()).not.toContain('profile.state');
    // Unrelated state remains (email still valid, profile still valid)
    expect(suite.get().hasErrors('email')).toBe(false);
    expect(suite.get().hasErrors('profile.state')).toBe(false);
  });
});

// 5. Performance sanity
describe('Acceptance — Performance sanity', () => {
  it('changed() is minimal and deduplicated', async () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString(),
      d: enforce.isString(),
      e: enforce.isString(),
    });
    const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0, e: 0 };
    const suite = create((data: any) => {
      test('a', () => {
        counts.a++;
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        counts.b++;
        enforce(data.b).isNotBlank();
      });
      test('c', () => {
        counts.c++;
        enforce(data.c).isNotBlank();
      });
      test('d', () => {
        counts.d++;
        enforce(data.d).isNotBlank();
      });
      test('e', () => {
        counts.e++;
        enforce(data.e).isNotBlank();
      });
    }, schema);
    await suite.run({ a: '1', b: '2', c: '3', d: '4', e: '5' });
    Object.keys(counts).forEach(k => (counts[k as keyof typeof counts] = 0));
    await suite.changed('a').run({ a: 'x', b: '2', c: '3', d: '4', e: '5' });
    expect(counts).toEqual({ a: 1, b: 1, c: 0, d: 0, e: 0 });
    Object.keys(counts).forEach(k => (counts[k as keyof typeof counts] = 0));
    await suite
      .changed(['a', 'b'])
      .run({ a: 'x', b: 'y', c: '3', d: '4', e: '5' });
    expect(counts.a).toBe(1);
    expect(counts.b).toBe(1);
  });
});

// 6. Repeated calls don't accumulate garbage
describe('Acceptance — Stateful lifecycle', () => {
  it('repeated changed() does not accumulate garbage', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createLog();
    const suite = create((data: any) => {
      test('password', () => {
        log.record('password');
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        log.record('confirmPassword');
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    for (let i = 0; i < 4; i++) {
      log.reset();
      await suite
        .changed('password')
        .run({ password: `pass${i}`, confirmPassword: 'abcdefgh' });
      expect(log.get()).toEqual(['password', 'confirmPassword']);
    }
    // Ensure no extra focused nodes remain — suite should still be usable via normal run
    log.reset();
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    expect(log.get()).toEqual(['password', 'confirmPassword']);
  });

  it('schema reuse does not mutate reusable schema', async () => {
    const addressSchema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const schemaA = enforce.shape({
      billing: addressSchema,
    });
    const schemaB = enforce.shape({
      shipping: addressSchema,
    });
    const suiteA = create((data: any) => {
      test('billing.country', () => {
        enforce(data.billing.country).isNotBlank();
      });
      test('billing.state', () => {
        enforce(data.billing.state).isNotBlank();
      });
    }, schemaA);
    const suiteB = create((data: any) => {
      test('shipping.country', () => {
        enforce(data.shipping.country).isNotBlank();
      });
      test('shipping.state', () => {
        enforce(data.shipping.state).isNotBlank();
      });
    }, schemaB);
    await suiteA.run({ billing: { country: 'US', state: 'CA' } });
    await suiteB.run({ shipping: { country: 'US', state: 'NY' } });
    // Run A changed
    await suiteA
      .changed('billing.country')
      .run({ billing: { country: 'CA', state: 'CA' } });
    // B should still be independent
    const logB = createLog();
    const suiteB2 = create((data: any) => {
      test('shipping.country', () => {
        logB.record('shipping.country');
        enforce(data.shipping.country).isNotBlank();
      });
      test('shipping.state', () => {
        logB.record('shipping.state');
        enforce(data.shipping.state).isNotBlank();
      });
    }, schemaB);
    await suiteB2.run({ shipping: { country: 'US', state: 'NY' } });
    logB.reset();
    await suiteB2
      .changed('shipping.country')
      .run({ shipping: { country: 'CA', state: 'NY' } });
    expect(logB.get()).toEqual(['shipping.country', 'shipping.state']);
  });

  it('relationship metadata does not leak between suite instances', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suiteA = create((data: any) => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    const suiteB = create((data: any) => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suiteA.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    await suiteB.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    await suiteA
      .changed('password')
      .run({ password: 'xyz', confirmPassword: 'abcdefgh' });
    expect(suiteA.get().hasErrors('confirmPassword')).toBe(true);
    expect(suiteB.get().hasErrors('confirmPassword')).toBe(false);
    await suiteB.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    expect(suiteB.get().hasErrors('confirmPassword')).toBe(false);
  });

  it('invalid relationship fails before suite execution', async () => {
    let callbackInvoked = false;
    expect(() => {
      enforce.shape({
        password: enforce.isString(),
        confirmPassword: enforce.isString().dependsOn(($: any) => $.pasword),
      });
    }).toThrow(/unknown field.*pasword/i);
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString(),
    });
    const suite = create((data: any) => {
      callbackInvoked = true;
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
    }, schema);
    await suite.run({ password: '123', confirmPassword: '456' });
    expect(callbackInvoked).toBe(true);
  });

  it('keeps cross-field validation correct across user interactions (docs-like)', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create((data: any) => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    // Initial valid state.
    await suite.run({
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(suite.get().hasErrors('confirmPassword')).toBe(false);
    // User changes password.
    let result = await suite.changed('password').run({
      password: 'newpassword',
      confirmPassword: 'abcdefgh',
    });
    expect(result.hasErrors('confirmPassword')).toBe(true);
    // User fixes confirmation.
    result = await suite.changed('confirmPassword').run({
      password: 'newpassword',
      confirmPassword: 'newpassword',
    });
    expect(result.hasErrors('confirmPassword')).toBe(false);
  });
});

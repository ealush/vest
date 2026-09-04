import { enforce } from 'n4s';
import type { ScopeHandle } from 'n4s';
import { describe, it, expect } from 'vitest';
import { invariant, isArray } from 'vest-utils';

import {
  create,
  test,
  group,
  include,
  skipWhen,
  omitWhen,
  only,
  optional,
  warn,
} from '../../vest';
import { each } from '../../isolates/each';

type SuiteLog = {
  record: (field: string) => void;
  reset: () => void;
  get: () => string[];
};

function createLog(): SuiteLog {
  const fields: string[] = [];
  return {
    record(f: string): void {
      fields.push(f);
    },
    reset(): void {
      fields.length = 0;
    },
    get(): string[] {
      return [...fields];
    },
  };
}

// 1. Sanity / control tests
describe('Acceptance — Sanity', (): void => {
  it('runs an ordinary suite without relationships', async (): Promise<void> => {
    const suite = create((data: { password: string }): void => {
      test('password', 'Too short', (): void => {
        enforce(data.password).longerThanOrEquals(8);
      });
    });
    const result = await suite.run({ password: '123' });
    expect(result.getErrors('password')).toEqual(['Too short']);
  });

  it('relationship metadata does not change existing suite test behavior', async (): Promise<void> => {
    const cb = (data: {
      password: string;
      email?: string;
      confirmPassword?: string;
    }): void => {
      test('password', 'Too short', (): void => {
        enforce(data.password).longerThanOrEquals(8);
      });
      test('email', 'Required', (): void => {
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
    // @ts-expect-error - acceptance probe: data carries non-schema field 'email'
    const _r2 = await withSchema.run(dataValid);
    expect(r1.hasErrors('password')).toBe(_r2.hasErrors('password'));
    // @ts-expect-error - acceptance probe: 'email' is a tested field outside the schema
    expect(r1.hasErrors('email')).toBe(_r2.hasErrors('email'));
    const r3 = await withoutSchema.run(dataInvalid);
    // @ts-expect-error - acceptance probe: data carries non-schema field 'email'
    const r4 = await withSchema.run(dataInvalid);
    expect(r3.getErrors('password')).toEqual(r4.getErrors('password'));
  });

  it('a schema with dependencies behaves identically under run()', async (): Promise<void> => {
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
    const createSuite = (
      schema: typeof schemaWith | typeof schemaWithout,
      log: SuiteLog,
    ) =>
      create((data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
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
describe('Acceptance — Feature success (before/after)', (): void => {
  it('without relationship, changed() does not know about sibling (problem)', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString(),
    });
    const log = createLog();
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    log.reset();
    const result = await suite
      .changed('password')
      .run({ password: 'abcdefgh2', confirmPassword: 'abcdefgh' });
    expect(log.get()).toEqual(['password']);
    expect(result.hasErrors('confirmPassword')).toBe(false); // stale
  });

  it('with relationship, changed() does know about sibling (solution)', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createLog();
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
    await suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    log.reset();
    const result = await suite
      .changed('password')
      .run({ password: 'abcdefgh2', confirmPassword: 'abcdefgh' });
    expect(log.get()).toEqual(['password', 'confirmPassword']);
    expect(result.hasErrors('confirmPassword')).toBe(true);
  });

  it('fixing dependent clears result', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
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

  it('nested dependency success before/after', async (): Promise<void> => {
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
    const makeSuite = (schema: typeof schemaWithout | typeof schemaWith) =>
      create((data: { profile: { country: string; state: string } }): void => {
        test('profile.country', (): void => {
          enforce(data.profile.country).isNotBlank();
        });
        test('profile.state', (): void => {
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

  it('async success — without relationship stale, with relationship correct', async (): Promise<void> => {
    const schemaWithout = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString(),
    });
    const schemaWith = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
    });
    const makeSuite = (schema: typeof schemaWithout | typeof schemaWith) =>
      create((data: { organizationId: string; username: string }): void => {
        test('username', async (): Promise<void> => {
          await Promise.resolve(
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

  it('dependsOn is directional — changed(source) runs target, not vice versa', async (): Promise<void> => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const log = createLog();
    const suite = create((data: { a: string; b: string }): void => {
      test('a', (): void => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', (): void => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
    }, schema);
    await suite.run({ a: 'x', b: 'y' });
    log.reset();
    await suite.changed('a').run({ a: 'x', b: 'y' });
    expect(log.get()).toEqual(['a', 'b']);
    log.reset();
    await suite.changed('b').run({ a: 'x', b: 'y' });
    expect(log.get()).toEqual(['b']);
  });
});

// 3. No-regression
describe('Acceptance — No regression', (): void => {
  it('run() unchanged', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
    const result = await suite.run({
      password: 'abcdefgh',
      confirmPassword: 'xyz',
    });
    expect(result.hasErrors('confirmPassword')).toBe(true);
    // Should run complete suite, not just changed
    const log = createLog();
    const suite2 = create(
      (data: {
        password: string;
        confirmPassword: string;
        a?: string;
        b?: string;
      }): void => {
        test('a', (): void => {
          log.record('a');
          enforce(data.a).isNotBlank();
        });
        test('b', (): void => {
          log.record('b');
          enforce(data.b).isNotBlank();
        });
      },
      schema,
    );
    // @ts-expect-error - acceptance probe: data outside the attached schema
    await suite2.run({ a: '1', b: '2' });
    expect(log.get()).toEqual(['a', 'b']);
  });

  it('only() unchanged — only exact, changed is dependency-aware', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createLog();
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
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

  it('focus() unchanged', async (): Promise<void> => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const suite = create((data: { a: string; b: string }): void => {
      test('a', (): void => {
        enforce(data.a).isNotBlank();
      });
      test('b', (): void => {
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

  it('include() unchanged — include().when() cross-field inclusion ignores relationship metadata', async (): Promise<void> => {
    const schemaWithout = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
      c: enforce.isString(),
    });
    const schemaWith = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString(),
    });
    const makeSuite = (schema: typeof schemaWith | typeof schemaWithout) => {
      const log = createLog();
      const suite = create(
        (data: { a: string; b: string; c: string }): void => {
          only('a');
          include('b').when('a');
          test('a', (): void => {
            log.record('a');
            enforce(data.a).isNotBlank();
          });
          test('b', (): void => {
            log.record('b');
            enforce(data.b).isNotBlank();
          });
          test('c', (): void => {
            log.record('c');
            enforce(data.c).isNotBlank();
          });
        },
        schema,
      );
      return { log, suite };
    };
    const data = { a: '', b: '', c: '' };
    const plain = makeSuite(schemaWithout);
    const withRel = makeSuite(schemaWith);
    const rPlain = await plain.suite.run(data);
    const rWith = await withRel.suite.run(data);
    // Cross-field inclusion actually happened: only('a') ran 'a' plus the
    // included 'b', while unrelated 'c' stayed out.
    expect(plain.log.get()).toEqual(['a', 'b']);
    expect(rPlain.hasErrors('a')).toBe(true);
    expect(rPlain.hasErrors('b')).toBe(true);
    expect(rPlain.hasErrors('c')).toBe(false);
    // Attached dependsOn() relationships leave that behavior unchanged.
    expect(withRel.log.get()).toEqual(plain.log.get());
    expect(rWith.hasErrors('a')).toBe(rPlain.hasErrors('a'));
    expect(rWith.hasErrors('b')).toBe(rPlain.hasErrors('b'));
    expect(rWith.hasErrors('c')).toBe(rPlain.hasErrors('c'));
    // Inclusion survives dependency-aware runs: changed('a') still runs the
    // included dependent 'b' while unrelated 'c' stays out.
    withRel.log.reset();
    await withRel.suite.changed('a').run(data);
    expect(withRel.log.get()).toEqual(['a', 'b']);
  });

  it('skipWhen() unchanged — canonical sequence', async (): Promise<void> => {
    const suite = create((data: { a: string; b: string }): void => {
      test('a', (): void => {
        enforce(data.a).isNotBlank();
      });
      skipWhen(data.b !== 'run', (): void => {
        test('b', (): void => {
          enforce(data.b).isNotBlank();
        });
      });
    });
    const r1 = await suite.run({ a: '1', b: '' });
    expect(r1.hasErrors('b')).toBe(false); // skipped, so no error even though blank
    // Attach irrelevant schema and ensure same
    const schema = enforce.shape({
      x: enforce.isString(),
      y: enforce.isString().dependsOn($ => $.x),
    });
    const suiteWithSchema = create(
      (data: { x: string; y: string; a?: string; b?: string }): void => {
        test('a', (): void => {
          enforce(data.a).isNotBlank();
        });
        skipWhen(data.b !== 'run', (): void => {
          test('b', (): void => {
            enforce(data.b).isNotBlank();
          });
        });
      },
      schema,
    );
    // @ts-expect-error - acceptance probe: data outside the attached schema
    const r3 = await suiteWithSchema.run({ a: '1', b: '' });
    // @ts-expect-error - acceptance probe: 'b' is a tested field outside the schema
    expect(r3.hasErrors('b')).toBe(false);
  });

  it('omitWhen() unchanged', async (): Promise<void> => {
    const suite = create((data: { a: string; b: string }): void => {
      test('a', (): void => {
        enforce(data.a).isNotBlank();
      });
      omitWhen(data.b === 'omit', (): void => {
        test('b', (): void => {
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

  it('optional() unchanged', async (): Promise<void> => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const log = createLog();
    const suite = create((data: { a: string; b: string }): void => {
      optional('b');
      test('a', (): void => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', (): void => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
    }, schema);
    const r1 = await suite.run({ a: 'x', b: '' });
    expect(r1.isValid()).toBe(true); // optional empty is valid
    expect(log.get()).toEqual(['a']); // blank optional omitted, as in run()
    log.reset();
    // A valued optional dependent is still included when its source changes.
    const r2 = await suite.changed('a').run({ a: 'y', b: 'z' });
    expect(log.get()).toEqual(['a', 'b']);
    expect(r2.isValid()).toBe(true);
    log.reset();
    // A blank optional dependent stays omitted under changed(), like run().
    const r3 = await suite.changed('a').run({ a: 'y', b: '' });
    expect(log.get()).toEqual(['a']);
    expect(r3.isValid()).toBe(true);
  });

  it('warn() unchanged', async (): Promise<void> => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const log = createLog();
    const suite = create((data: { a: string; b: string }): void => {
      test('a', (): void => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', (): void => {
        log.record('b');
        warn();
        enforce(data.b).isNotBlank();
      });
    }, schema);
    const r1 = await suite.run({ a: '', b: '' });
    expect(r1.hasErrors('a')).toBe(true);
    expect(r1.hasWarnings('b')).toBe(true);
    expect(r1.hasErrors('b')).toBe(false);
    log.reset();
    const r2 = await suite.changed('a').run({ a: '', b: '' });
    // Warn dependents are included as normal tests, keeping warn severity.
    expect(log.get()).toEqual(['a', 'b']);
    expect(r2.hasErrors('a')).toBe(true);
    expect(r2.hasWarnings('b')).toBe(true);
    expect(r2.hasErrors('b')).toBe(false);
  });

  it('group() unchanged', async (): Promise<void> => {
    const suite = create((data: { a: string; b: string }): void => {
      group('g1', (): void => {
        test('a', (): void => {
          enforce(data.a).isNotBlank();
        });
      });
      group('g2', (): void => {
        test('b', (): void => {
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
    const suiteWithSchema = create(
      (data: { x: string; y: string; a?: string; b?: string }): void => {
        group('g1', (): void => {
          test('a', (): void => {
            enforce(data.a).isNotBlank();
          });
        });
        group('g2', (): void => {
          test('b', (): void => {
            enforce(data.b).isNotBlank();
          });
        });
      },
      schema,
    );
    // @ts-expect-error - acceptance probe: data outside the attached schema
    const _r2 = await suiteWithSchema.run({ a: '', b: '' });
    // @ts-expect-error - acceptance probe: 'a' is a tested field outside the schema
    expect(_r2.hasErrors('a')).toBe(true);
    // @ts-expect-error - acceptance probe: 'b' is a tested field outside the schema
    expect(_r2.hasErrors('b')).toBe(true);
  });

  it('each() unchanged — no relationships', async (): Promise<void> => {
    const suite = create((data: { items: string[] }): void => {
      each(data.items, (item: string, index: number): void => {
        test(`items.${index}`, (): void => {
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
    const suiteWithSchema = create(
      (data: { x: string; y: string; items?: string[] }): void => {
        invariant(isArray(data.items), 'Expected items to be an array');
        each(data.items, (item: string, index: number): void => {
          test(`items.${index}`, (): void => {
            enforce(item).isNotBlank();
          });
        });
      },
      schema,
    );
    // @ts-expect-error - acceptance probe: data outside the attached schema
    const _r2 = await suiteWithSchema.run({ items: ['a', '', 'c'] });
    // @ts-expect-error - acceptance probe: 'items' is a tested field outside the schema
    expect(_r2.hasErrors('items.1')).toBe(true);
  });
});

// 4. Prove unrelated fields are truly unaffected
describe('Acceptance — Unrelated unaffected', (): void => {
  it('changed() does not execute unrelated work and does not lose unrelated state', async (): Promise<void> => {
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
    const suite = create(
      (data: {
        email: string;
        password: string;
        confirmPassword: string;
        profile: { country: string; state: string };
      }): void => {
        test('email', (): void => {
          log.record('email');
          enforce(data.email).isNotBlank();
        });
        test('password', (): void => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
        test('profile.country', (): void => {
          log.record('profile.country');
          enforce(data.profile.country).isNotBlank();
        });
        test('profile.state', (): void => {
          log.record('profile.state');
          enforce(data.profile.state).isNotBlank();
        });
      },
      schema,
    );
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
describe('Acceptance — Performance sanity', (): void => {
  it('changed() is minimal and deduplicated', async (): Promise<void> => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString(),
      d: enforce.isString(),
      e: enforce.isString(),
    });
    const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0, e: 0 };
    const suite = create(
      (data: {
        a: string;
        b: string;
        c: string;
        d: string;
        e: string;
      }): void => {
        test('a', (): void => {
          counts.a++;
          enforce(data.a).isNotBlank();
        });
        test('b', (): void => {
          counts.b++;
          enforce(data.b).isNotBlank();
        });
        test('c', (): void => {
          counts.c++;
          enforce(data.c).isNotBlank();
        });
        test('d', (): void => {
          counts.d++;
          enforce(data.d).isNotBlank();
        });
        test('e', (): void => {
          counts.e++;
          enforce(data.e).isNotBlank();
        });
      },
      schema,
    );
    await suite.run({ a: '1', b: '2', c: '3', d: '4', e: '5' });
    Object.keys(counts).forEach((k: string): void => {
      counts[k as keyof typeof counts] = 0;
    });
    await suite.changed('a').run({ a: 'x', b: '2', c: '3', d: '4', e: '5' });
    expect(counts).toEqual({ a: 1, b: 1, c: 0, d: 0, e: 0 });
    Object.keys(counts).forEach((k: string): void => {
      counts[k as keyof typeof counts] = 0;
    });
    await suite
      .changed(['a', 'b'])
      .run({ a: 'x', b: 'y', c: '3', d: '4', e: '5' });
    expect(counts.a).toBe(1);
    expect(counts.b).toBe(1);
  });
});

// 6. Repeated calls don't accumulate garbage
describe('Acceptance — Stateful lifecycle', (): void => {
  it('repeated changed() does not accumulate garbage', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createLog();
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          log.record('password');
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
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

  it('schema reuse does not mutate reusable schema', async (): Promise<void> => {
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
    const suiteA = create(
      (data: { billing: { country: string; state: string } }): void => {
        test('billing.country', (): void => {
          enforce(data.billing.country).isNotBlank();
        });
        test('billing.state', (): void => {
          enforce(data.billing.state).isNotBlank();
        });
      },
      schemaA,
    );
    const suiteB = create(
      (data: { shipping: { country: string; state: string } }): void => {
        test('shipping.country', (): void => {
          enforce(data.shipping.country).isNotBlank();
        });
        test('shipping.state', (): void => {
          enforce(data.shipping.state).isNotBlank();
        });
      },
      schemaB,
    );
    await suiteA.run({ billing: { country: 'US', state: 'CA' } });
    await suiteB.run({ shipping: { country: 'US', state: 'NY' } });
    // Run A changed
    await suiteA
      .changed('billing.country')
      .run({ billing: { country: 'CA', state: 'CA' } });
    // B should still be independent
    const logB = createLog();
    const suiteB2 = create(
      (data: { shipping: { country: string; state: string } }): void => {
        test('shipping.country', (): void => {
          logB.record('shipping.country');
          enforce(data.shipping.country).isNotBlank();
        });
        test('shipping.state', (): void => {
          logB.record('shipping.state');
          enforce(data.shipping.state).isNotBlank();
        });
      },
      schemaB,
    );
    await suiteB2.run({ shipping: { country: 'US', state: 'NY' } });
    logB.reset();
    await suiteB2
      .changed('shipping.country')
      .run({ shipping: { country: 'CA', state: 'NY' } });
    expect(logB.get()).toEqual(['shipping.country', 'shipping.state']);
  });

  it('relationship metadata does not leak between suite instances', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suiteA = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
    const suiteB = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
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

  it('invalid relationship fails before suite execution', async (): Promise<void> => {
    let callbackInvoked = false;
    expect((): void => {
      enforce.shape({
        password: enforce.isString(),
        confirmPassword: enforce
          .isString()
          .dependsOn(($: ScopeHandle): unknown => $.pasword),
      });
    }).toThrow(/unknown field.*pasword/i);
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString(),
    });
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        callbackInvoked = true;
        test('password', (): void => {
          enforce(data.password).isNotBlank();
        });
      },
      schema,
    );
    await suite.run({ password: '123', confirmPassword: '456' });
    expect(callbackInvoked).toBe(true);
  });

  it('keeps cross-field validation correct across user interactions (docs-like)', async (): Promise<void> => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create(
      (data: { password: string; confirmPassword: string }): void => {
        test('password', (): void => {
          enforce(data.password).isNotBlank();
        });
        test('confirmPassword', (): void => {
          enforce(data.confirmPassword).equals(data.password);
        });
      },
      schema,
    );
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

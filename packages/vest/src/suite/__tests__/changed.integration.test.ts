import { enforce, runSchemaPaths } from 'n4s';
import { describe, it, expect } from 'vitest';

import {
  create,
  test,
  group,
  skipWhen,
  omitWhen,
  optional,
  warn,
  include,
} from '../../vest';
import { each } from '../../isolates/each';

type Deferred = {
  promise: Promise<void>;
  release: () => void;
};

function createDeferred(): Deferred {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}

// Drains pending microtasks and one macrotask turn without any wall-clock
// margin: the stale async continuation after a gate release is a bounded
// microtask chain, so awaiting it to quiesce is deterministic.
function flushAsyncWork(): Promise<void> {
  return new Promise<void>(resolve => {
    setImmediate(resolve);
  });
}

function createExecutionLog() {
  const fields: string[] = [];
  return {
    record(field: string) {
      fields.push(field);
    },
    reset() {
      fields.length = 0;
    },
    get() {
      return [...fields];
    },
    expect(...expected: string[]) {
      expect(fields).toEqual(expected);
    },
  };
}

describe('Integration: suite.changed() — merge gate (13)', () => {
  // 1. Flat dependent rerun
  it('1. flat dependent rerun — changed(password) runs password + confirmPassword', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createExecutionLog();
    const suite = create(
      (data: { password: string; confirmPassword: string; email?: string }) => {
        test('password', () => {
          log.record('password');
          enforce(data.password).longerThanOrEquals(8);
        });
        test('confirmPassword', () => {
          log.record('confirmPassword');
          enforce(data.confirmPassword).equals(data.password);
        });
        test('email', () => {
          log.record('email');
          enforce(data.email).isNotBlank();
        });
      },
      schema,
    );

    await suite.run({
      // @ts-expect-error - integration probe: data carries non-schema field 'email'
      email: 'a@b.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    log.reset();
    const result = await suite.changed('password').run({
      // @ts-expect-error - integration probe: data carries non-schema field 'email'
      email: 'a@b.com',
      password: 'abcdefgh2',
      confirmPassword: 'abcdefgh',
    });
    expect(log.get()).toEqual(['password', 'confirmPassword']);
    expect(result.hasErrors('password')).toBe(false);
    expect(result.hasErrors('confirmPassword')).toBe(true);
  });

  // 2. Inverse does not rerun source
  it('2. directionality — changed(confirmPassword) does NOT run password', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createExecutionLog();
    const suite = create(data => {
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
      .changed('confirmPassword')
      .run({ password: 'abcdefgh', confirmPassword: 'xyz' });
    expect(log.get()).toEqual(['confirmPassword']);
  });

  // 3. Unrelated retained error survives
  it('3. unrelated retained errors survive changed()', async () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create(data => {
      test('email', 'Email required', () => {
        enforce(data.email).isNotBlank();
      });
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    await suite.run({
      email: '',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(suite.get().hasErrors('email')).toBe(true);
    const result = await suite
      .changed('password')
      .run({ email: '', password: 'xyz', confirmPassword: 'abcdefgh' });
    expect(result.hasErrors('email')).toBe(true);
    expect(result.hasErrors('confirmPassword')).toBe(true);
  });

  // 4. Nested dependency
  it('4. nested dependency — changed(profile.country) runs profile.state', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('profile.country', () => {
        log.record('profile.country');
        enforce(data.profile.country).isNotBlank();
      });
      test('profile.state', () => {
        log.record('profile.state');
        if (data.profile.country === 'US')
          enforce(data.profile.state).isNotBlank();
      });
    }, schema);
    await suite.run({ profile: { country: 'CA', state: '' } });
    log.reset();
    const result = await suite
      .changed('profile.country')
      .run({ profile: { country: 'US', state: '' } });
    expect(log.get()).toEqual(['profile.country', 'profile.state']);
    expect(result.hasErrors('profile.state')).toBe(true);
  });

  // 5. Reusable nested schema isolated
  it('5. reusable nested schema remains isolated', async () => {
    const addressSchema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      billing: addressSchema,
      shipping: addressSchema,
    });
    const log = createExecutionLog();
    const suite = create(data => {
      group('billing', () => {
        test('billing.country', () => {
          log.record('billing.country');
          enforce(data.billing.country).isNotBlank();
        });
        test('billing.state', () => {
          log.record('billing.state');
          enforce(data.billing.state).isNotBlank();
        });
      });
      group('shipping', () => {
        test('shipping.country', () => {
          log.record('shipping.country');
          enforce(data.shipping.country).isNotBlank();
        });
        test('shipping.state', () => {
          log.record('shipping.state');
          enforce(data.shipping.state).isNotBlank();
        });
      });
    }, schema);
    await suite.run({
      billing: { country: 'US', state: 'CA' },
      shipping: { country: 'US', state: 'NY' },
    });
    log.reset();
    await suite.changed('billing.country').run({
      billing: { country: 'CA', state: 'CA' },
      shipping: { country: 'US', state: 'NY' },
    });
    expect(log.get()).toEqual(['billing.country', 'billing.state']);
    expect(log.get()).not.toContain('shipping.country');
  });

  // 6. Same-array-item dependency
  it('6. same-array-item — changed(travelers.1.country) affects only travelers.1.passport', async () => {
    const travelerSchema = enforce.shape({
      country: enforce.isString(),
      passportNumber: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      travelers: enforce.isArrayOf(travelerSchema),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      each(data.travelers, (traveler, index) => {
        test(`travelers.${index}.country`, () => {
          log.record(`travelers.${index}.country`);
          enforce(traveler.country).isNotBlank();
        });
        test(`travelers.${index}.passportNumber`, () => {
          log.record(`travelers.${index}.passportNumber`);
          enforce(traveler.passportNumber).isNotBlank();
        });
      });
    }, schema);
    const data = {
      travelers: [
        { country: 'US', passportNumber: 'A' },
        { country: 'IL', passportNumber: 'B' },
        { country: 'FR', passportNumber: 'C' },
      ],
    };
    await suite.run(data);
    log.reset();
    const next = {
      travelers: [
        { country: 'US', passportNumber: 'A' },
        { country: 'CA', passportNumber: 'B' },
        { country: 'FR', passportNumber: 'C' },
      ],
    };
    await suite.changed('travelers.1.country').run(next);
    expect(log.get()).toEqual([
      'travelers.1.country',
      'travelers.1.passportNumber',
    ]);
    expect(log.get()).not.toContain('travelers.0.passportNumber');
    expect(log.get()).not.toContain('travelers.2.passportNumber');
  });

  // 7. Multiple dependents dedupe
  it('7. multiple dependents dedupe — changed(password) runs both dependents once', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
      passwordStrengthMessage: enforce.isString().dependsOn($ => $.password),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('password', () => {
        log.record('password');
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        log.record('confirmPassword');
        enforce(data.confirmPassword).equals(data.password);
      });
      test('passwordStrengthMessage', () => {
        log.record('passwordStrengthMessage');
        enforce(data.password).longerThan(5);
      });
    }, schema);
    await suite.run({
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
      passwordStrengthMessage: 'ok',
    });
    log.reset();
    await suite.changed('password').run({
      password: 'xyz',
      confirmPassword: 'abcdefgh',
      passwordStrengthMessage: 'ok',
    });
    expect(log.get()).toEqual([
      'password',
      'confirmPassword',
      'passwordStrengthMessage',
    ]);
  });

  // 8. Non-transitive
  it('8. non-transitive — A->B, B->C, changed(A) runs A,B not C', async () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString().dependsOn($ => $.b),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('a', () => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
      test('c', () => {
        log.record('c');
        enforce(data.c).isNotBlank();
      });
    }, schema);
    await suite.run({ a: '1', b: '2', c: '3' });
    log.reset();
    await suite.changed('a').run({ a: 'x', b: '2', c: '3' });
    expect(log.get()).toEqual(['a', 'b']);
    expect(log.get()).not.toContain('c');
  });

  // 9. only() stays explicit
  it('9. only() ignores dependencies', async () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const log = createExecutionLog();
    const suite = create(data => {
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

  // 10. skipWhen
  it('10. skipWhen — dependency affects candidate but Vest semantics remain authoritative', async () => {
    const schema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('country', () => {
        log.record('country');
        enforce(data.country).isNotBlank();
      });

      skipWhen(data.country !== 'US', () => {
        test('state', () => {
          log.record('state');
          enforce(data.state).isNotBlank();
        });
      });
    }, schema);
    await suite.run({ country: 'CA', state: '' });
    log.reset();
    await suite.changed('country').run({ country: 'US', state: '' });
    // country changed, state is affected and is now not skipped, so both run
    expect(log.get()).toEqual(['country', 'state']);
  });

  // 11. async dependent rerun
  it('11. async dependent rerun — changed(organizationId) reruns username', async () => {
    const schema = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('organizationId', () => {
        log.record('organizationId');
        enforce(data.organizationId).isNotBlank();
      });
      test('username', async () => {
        log.record('username');
        const available = await Promise.resolve(data.username !== 'taken');
        enforce(available).isTruthy();
      });
    }, schema);
    await suite.run({ organizationId: 'A', username: 'free' });
    log.reset();
    await suite
      .changed('organizationId')
      .run({ organizationId: 'B', username: 'free' });
    expect(log.get()).toEqual(['organizationId', 'username']);
  });

  // 12. stale async cannot win — deterministic: A is gated behind a manual
  // deferred (no wall-clock margins). The superseded run adopts the
  // successor's promise, so awaiting p1 observes B's outcome and the stale
  // late result can never surface through any handle.
  it('12. stale async result cannot win after changed()', async () => {
    const schema = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
    });
    const gate = createDeferred();
    const firstDone = createDeferred();
    const suite = create(data => {
      test('username', async () => {
        try {
          // Only the stale run waits; the successor never blocks on it.
          if (data.organizationId === 'A') {
            await gate.promise;
          }
          const available = data.organizationId !== 'B';
          enforce(available).isTruthy();
        } finally {
          if (data.organizationId === 'A') {
            firstDone.release();
          }
        }
      });
    }, schema);
    const p1 = suite.run({ organizationId: 'A', username: 'evyatar' });
    const p2 = suite
      .changed('organizationId')
      .run({ organizationId: 'B', username: 'evyatar' });
    // B wins: its invalid username is the current state.
    const r2 = await p2;
    expect(r2.hasErrors('username')).toBe(true);
    expect(suite.get().hasErrors('username')).toBe(true);
    // Release A; its late completion is neutralized by the reconciler, and
    // p1 adopted p2's promise at B's start, so both handles agree.
    gate.release();
    await firstDone.promise;
    await flushAsyncWork();
    const r1 = await p1;
    expect(r1.hasErrors('username')).toBe(true);
    expect(r1).toBe(r2);
    expect(suite.get().hasErrors('username')).toBe(true);
  });

  // 13. realistic registration flow
  it('13. realistic registration flow sequence', async () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(data => {
      test('email', 'Email required', () => {
        enforce(data.email).isNotBlank();
      });
      test('password', () => {
        enforce(data.password).longerThanOrEquals(8);
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
      test('username', async () => {
        const available = await Promise.resolve(data.username !== 'taken');
        enforce(available).isTruthy();
      });
      test('profile.country', () => {
        enforce(data.profile.country).isNotBlank();
      });
      test('profile.state', () => {
        if (data.profile.country === 'US')
          enforce(data.profile.state).isNotBlank();
      });
    }, schema);

    // Initial submit
    await suite.run({
      email: '',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
      organizationId: 'A',
      username: 'free',
      profile: { country: 'CA', state: '' },
    });
    expect(suite.get().hasErrors('email')).toBe(true);

    // Fix email via changed
    await suite.changed('email').run({
      email: 'a@b.com',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
      organizationId: 'A',
      username: 'free',
      profile: { country: 'CA', state: '' },
    });
    expect(suite.get().hasErrors('email')).toBe(false);

    // Change password
    await suite.changed('password').run({
      email: 'a@b.com',
      password: 'abcdefgh2',
      confirmPassword: 'abcdefgh',
      organizationId: 'A',
      username: 'free',
      profile: { country: 'CA', state: '' },
    });
    expect(suite.get().hasErrors('confirmPassword')).toBe(true);

    // Fix confirmation
    await suite.changed('confirmPassword').run({
      email: 'a@b.com',
      password: 'abcdefgh2',
      confirmPassword: 'abcdefgh2',
      organizationId: 'A',
      username: 'free',
      profile: { country: 'CA', state: '' },
    });
    expect(suite.get().hasErrors('confirmPassword')).toBe(false);

    // Change country CA->US
    await suite.changed('profile.country').run({
      email: 'a@b.com',
      password: 'abcdefgh2',
      confirmPassword: 'abcdefgh2',
      organizationId: 'A',
      username: 'free',
      profile: { country: 'US', state: '' },
    });
    expect(suite.get().hasErrors('profile.state')).toBe(true);
  });

  // --- Additional matrix rows (V1 coverage) ---

  it('14. multi-source dependsOn([$.a, $.b]) — changed(a) and changed(b) each trigger', async () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
      c: enforce.isString().dependsOn($ => [$.a, $.b]),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('a', () => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
      test('c', () => {
        log.record('c');
        enforce(data.c).isNotBlank();
      });
    }, schema);

    await suite.run({ a: '1', b: '2', c: '3' });

    log.reset();
    await suite.changed('a').run({ a: 'x', b: '2', c: '3' });
    expect(log.get()).toEqual(['a', 'c']);

    log.reset();
    await suite.changed('b').run({ a: 'x', b: 'y', c: '3' });
    expect(log.get()).toEqual(['b', 'c']);

    // Both changed together deduplicates c to once
    log.reset();
    await suite.changed(['a', 'b']).run({ a: 'x2', b: 'y2', c: '3' });
    const got = log.get();
    expect(got).toContain('a');
    expect(got).toContain('b');
    expect(got).toContain('c');
    // c appears exactly once (deduplication)
    expect(got.filter(f => f === 'c')).toHaveLength(1);
  });

  it('15. array reorder — same items different order does not over-invalidate', async () => {
    const itemSchema = enforce.shape({
      country: enforce.isString(),
      passport: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      travelers: enforce.isArrayOf(itemSchema),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      each(data.travelers, (traveler, i) => {
        test(`travelers.${i}.country`, () => {
          log.record(`travelers.${i}.country`);
          enforce(traveler.country).isNotBlank();
        });
        test(`travelers.${i}.passport`, () => {
          log.record(`travelers.${i}.passport`);
          enforce(traveler.passport).isNotBlank();
        });
      });
    }, schema);

    const base = {
      travelers: [
        { country: 'US', passport: 'P1' },
        { country: 'IL', passport: 'P2' },
        { country: 'FR', passport: 'P3' },
      ],
    };
    await suite.run(base);

    // Reordered same 3 items (different order) — changed on index 1 only affects index 1's dependent
    log.reset();
    const reordered = {
      travelers: [
        { country: 'FR', passport: 'P3' },
        { country: 'US', passport: 'P1' },
        { country: 'IL', passport: 'P2' },
      ],
    };
    // Same-item semantics: changed travelers.1.country only touches travelers.1.passport
    await suite.changed('travelers.1.country').run(reordered);
    expect(log.get()).toEqual(['travelers.1.country', 'travelers.1.passport']);
    expect(log.get()).not.toContain('travelers.0.passport');
    expect(log.get()).not.toContain('travelers.2.passport');

    // Changing index 0 separately still isolates
    log.reset();
    await suite.changed('travelers.0.country').run(reordered);
    expect(log.get()).toEqual(['travelers.0.country', 'travelers.0.passport']);
  });

  it('16. nested arrays orders[$item].items[$item] depth 4', async () => {
    const item = enforce.shape({
      name: enforce.isString(),
      discount: enforce.isString().dependsOn($ => $.name),
    });
    const order = enforce.shape({
      items: enforce.isArrayOf(item),
    });
    const schema = enforce.shape({
      orders: enforce.isArrayOf(order),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      each(data.orders, (orderData, oi) => {
        each(orderData.items, (it, ii) => {
          test(`orders.${oi}.items.${ii}.name`, () => {
            log.record(`orders.${oi}.items.${ii}.name`);
            enforce(it.name).isNotBlank();
          });
          test(`orders.${oi}.items.${ii}.discount`, () => {
            log.record(`orders.${oi}.items.${ii}.discount`);
            enforce(it.discount).isNotBlank();
          });
        });
      });
    }, schema);

    const data = {
      orders: [
        {
          items: [
            { name: 'A', discount: '5%' },
            { name: 'B', discount: '10%' },
          ],
        },
        { items: [{ name: 'C', discount: '0%' }] },
      ],
    };
    await suite.run(data);
    log.reset();
    // Change nested leaf in order 0, item 1 — only that item's dependent reruns
    await suite.changed('orders.0.items.1.name').run(data);
    expect(log.get()).toEqual([
      'orders.0.items.1.name',
      'orders.0.items.1.discount',
    ]);
    expect(log.get()).not.toContain('orders.0.items.0.discount');
    expect(log.get()).not.toContain('orders.1.items.0.discount');

    // Verify describe depth 4 has two item bindings
    const dep = schema.describe().dependencies[0];
    const itemCount = dep.target.filter(s => s.type === 'item').length;
    expect(itemCount).toBe(2);
  });

  it('17. 3-level transitive a.b.c -> a.b.d (deep nested sibling)', async () => {
    type DataWithOther = {
      a: { b: { c: string; d: string; other?: string } };
    };
    const inner = enforce.shape({
      c: enforce.isString(),
      d: enforce.isString().dependsOn($ => $.c),
    });
    const middle = enforce.shape({
      b: inner,
    });
    const schema = enforce.shape({
      a: middle,
    });
    const log = createExecutionLog();
    const suite = create((data: DataWithOther) => {
      test('a.b.c', () => {
        log.record('a.b.c');
        enforce(data.a.b.c).isNotBlank();
      });
      test('a.b.d', () => {
        log.record('a.b.d');
        enforce(data.a.b.d).isNotBlank();
      });
      test('a.b.other', () => {
        log.record('a.b.other');
        enforce(data.a.b.other).isNotBlank();
      });
    }, schema);

    // @ts-expect-error - integration probe: data carries non-schema field 'other'
    await suite.run({ a: { b: { c: 'x', d: 'y', other: 'z' } } });
    log.reset();
    await suite
      .changed('a.b.c')
      // @ts-expect-error - integration probe: data carries non-schema field 'other'
      .run({ a: { b: { c: 'xx', d: 'y', other: 'z' } } });
    expect(log.get()).toEqual(['a.b.c', 'a.b.d']);
    expect(log.get()).not.toContain('a.b.other');
  });

  it('18. $.root — changed(rootField) invalidates nested dependent', async () => {
    const schema = enforce.shape({
      accountType: enforce.isString(),
      company: enforce.shape({
        country: enforce.isString(),
        taxId: enforce
          .isString()
          .dependsOn($ => [$.country, $.root.accountType]),
      }),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('accountType', () => {
        log.record('accountType');
        enforce(data.accountType).isNotBlank();
      });
      test('company.country', () => {
        log.record('company.country');
        enforce(data.company.country).isNotBlank();
      });
      test('company.taxId', () => {
        log.record('company.taxId');
        enforce(data.company.taxId).isNotBlank();
      });
    }, schema);

    await suite.run({
      accountType: 'personal',
      company: { country: 'US', taxId: '123' },
    });
    log.reset();
    await suite.changed('accountType').run({
      accountType: 'business',
      company: { country: 'US', taxId: '123' },
    });
    // accountType change must invalidate company.taxId via $.root edge
    expect(log.get()).toEqual(
      expect.arrayContaining(['accountType', 'company.taxId']),
    );
    expect(log.get()).toContain('company.taxId');

    // Changing sibling country also invalidates taxId, but via local edge
    log.reset();
    await suite.changed('company.country').run({
      accountType: 'business',
      company: { country: 'CA', taxId: '123' },
    });
    expect(log.get()).toEqual(['company.country', 'company.taxId']);
  });

  it('19. cycle terminates — a->b, b->a, changed(a) => a,b only once', async () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.b),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const log = createExecutionLog();
    const suite = create((data: { a: string; b: string; c?: string }) => {
      test('a', () => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
      test('c', () => {
        log.record('c');
        enforce(data.c).isNotBlank();
      });
    }, schema);

    // @ts-expect-error - integration probe: data carries non-schema field 'c'
    await suite.run({ a: '1', b: '2', c: '3' });
    log.reset();
    // @ts-expect-error - integration probe: data carries non-schema field 'c'
    await suite.changed('a').run({ a: 'x', b: '2', c: '3' });
    // Non-transitive + deduped: a changes -> b reruns, but b's change does not loop back to a again or to c
    const got = log.get();
    expect(got).toContain('a');
    expect(got).toContain('b');
    expect(got).not.toContain('c');
    expect(got.filter(f => f === 'a')).toHaveLength(1);
    expect(got.filter(f => f === 'b')).toHaveLength(1);

    log.reset();
    // @ts-expect-error - integration probe: data carries non-schema field 'c'
    await suite.changed('b').run({ a: 'x', b: 'y', c: '3' });
    const got2 = log.get();
    expect(got2).toContain('a');
    expect(got2).toContain('b');
    expect(got2.filter(f => f === 'b')).toHaveLength(1);
  });

  // 20. only() merges into the changed() affected set
  it('20. only() merges with changed() — base-only plus affected all run', async () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString(),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('a', () => {
        log.record('a');
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        log.record('b');
        enforce(data.b).isNotBlank();
      });
      test('c', () => {
        log.record('c');
        enforce(data.c).isNotBlank();
      });
    }, schema);
    await suite.run({ a: 'x', b: 'y', c: 'z' });
    log.reset();
    await suite.only('c').changed('a').run({ a: 'x', b: 'y', c: 'z' });
    expect(log.get().sort()).toEqual(['a', 'b', 'c']);
  });

  // 22. omitWhen removes the dependent test but the edge still exists
  it('22. omitWhen — dependent edge recorded but omitted test never runs', async () => {
    const schema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('country', () => {
        log.record('country');
        enforce(data.country).isNotBlank();
      });
      omitWhen(true, () => {
        test('state', () => {
          log.record('state');
          enforce(data.state).isNotBlank();
        });
      });
    }, schema);
    const result = await suite
      .changed('country')
      .run({ country: 'US', state: '' });
    expect(log.get()).toEqual(['country']);
    expect(result.hasErrors('country')).toBe(false);
  });

  // 23. optional() fields keep their dependency edges under changed()
  it('23. optional() — dependent edge fires alongside the optional marker', async () => {
    const schema = enforce.shape({
      country: enforce.isString(),
      nick: enforce.isString().dependsOn($ => $.country),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      optional('nick');
      test('country', () => {
        log.record('country');
        enforce(data.country).isNotBlank();
      });
      test('nick', () => {
        log.record('nick');
        enforce(data.nick).isNotBlank();
      });
    }, schema);
    await suite.run({ country: 'US', nick: 'bob' });
    log.reset();
    await suite.changed('country').run({ country: 'CA', nick: 'bob' });
    expect(log.get()).toEqual(['country', 'nick']);
  });

  // 24. warn dependents are included as normal tests
  it('24. warn — dependent warn test runs on source change', async () => {
    const schema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('country', () => {
        log.record('country');
        enforce(data.country).isNotBlank();
      });
      test('state', () => {
        log.record('state');
        warn();
        enforce(data.state).isNotBlank();
      });
    }, schema);
    await suite.run({ country: 'US', state: 'CA' });
    log.reset();
    await suite.changed('country').run({ country: 'US', state: 'CA' });
    expect(log.get()).toEqual(['country', 'state']);
  });

  // 25. group dependents respect rebasing under changed()
  it('25. group — dependent inside a group runs on source change', async () => {
    const schema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      test('country', () => {
        log.record('country');
        enforce(data.country).isNotBlank();
      });
      group('address', () => {
        test('state', () => {
          log.record('state');
          enforce(data.state).isNotBlank();
        });
      });
    }, schema);
    await suite.run({ country: 'US', state: 'CA' });
    log.reset();
    await suite.changed('country').run({ country: 'US', state: 'CA' });
    expect(log.get()).toEqual(['country', 'state']);
  });

  // 26. include().when() under changed() — both the included branch
  // (condition field is part of the run) and the withheld branch
  // (condition field is not part of the run). The schema deliberately has
  // no country->state dependency edge, so `include()` is the only reason
  // 'state' can run: it is never in the affected set itself.
  it('26. include().when() — conditional inclusion coexists with changed()', async () => {
    const schema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString(),
      city: enforce.isString(),
    });
    const log = createExecutionLog();
    const suite = create(data => {
      include('state').when('country');
      test('country', () => {
        log.record('country');
        enforce(data.country).isNotBlank();
      });
      test('state', () => {
        log.record('state');
        enforce(data.state).isNotBlank();
      });
      test('city', () => {
        log.record('city');
        enforce(data.city).isNotBlank();
      });
    }, schema);
    await suite.run({ country: 'US', state: 'CA', city: 'NYC' });
    log.reset();
    // Condition met: 'country' is in the changed() run, so inclusion fires
    // and otherwise-unaffected 'state' runs.
    await suite
      .changed('country')
      .run({ country: 'US', state: 'CA', city: 'NYC' });
    expect(log.get()).toEqual(['country', 'state']);
    log.reset();
    // Condition unmet: 'country' is not in the changed() run, so inclusion
    // is withheld and 'state' stays skipped.
    await suite.changed('city').run({ country: 'US', state: 'CA', city: 'LA' });
    expect(log.get()).toEqual(['city']);
  });

  // 27. root-container suite schemas filter failures by affected path.
  // Pins the schema-level filter (n4s `runSchemaPaths` affected narrowing),
  // not just focus exclusion: focus-excluded tests still land in the result
  // inventory as skipped nodes, so a missing key proves the failure was
  // dropped before emission — only the schema-level filter can do that.
  it('27. root array schema — changed() reports only affected failures', async () => {
    const schema = enforce.isArrayOf(
      enforce.shape({
        country: enforce.isString().longerThan(5),
        state: enforce.isString().longerThan(5),
      }),
    );
    const data = [
      { country: 'abcdef', state: 'abcdef' },
      { country: 'abcdef', state: 'yy' },
    ];
    const failurePaths = (
      results: readonly { pass: boolean; path?: readonly string[] }[],
    ): string[] =>
      results
        .filter(result => !result.pass)
        .map(result => (result.path ?? []).join('.'));
    // Schema level: the full run surfaces the 1.state failure (array runs
    // short-circuit at the first failing element); narrowing to the
    // affected path keeps exactly it, while narrowing to an unaffected
    // path drops it via pass-through.
    expect(failurePaths(runSchemaPaths(schema, data))).toEqual(['1.state']);
    expect(
      failurePaths(runSchemaPaths(schema, data, { affected: ['1.state'] })),
    ).toEqual(['1.state']);
    expect(
      runSchemaPaths(schema, data, { affected: ['0.state'] }).some(
        result => !result.pass,
      ),
    ).toBe(false);
    // Suite level: the same narrowing is observable through changed().
    const suite = create(() => {}, schema);
    const affected = await suite.changed('1.state').run(data);
    // @ts-expect-error - integration probe: array-element paths ('1.state')
    // are runtime failure names the type-level field vocabulary cannot name.
    expect(affected.hasErrors('1.state')).toBe(true);
    // @ts-expect-error - integration probe: see above.
    expect(affected.hasErrors('0.state')).toBe(false);
    const unaffected = await suite.changed('0.state').run(data);
    // @ts-expect-error - integration probe: see above.
    expect(unaffected.hasErrors('1.state')).toBe(false);
    expect(Object.keys(unaffected.tests)).not.toContain('1.state');
  });

  // 28. ownership chaining is per-suite, not changed()-specific: a plain
  // run adopts its plain successor's promise, so the stale handle observes
  // the latest outcome.
  it('28. plain run adopts its plain successor outcome', async () => {
    const gate = createDeferred();
    const firstDone = createDeferred();
    const suite = create((data: { tag: string }) => {
      test('tag', async () => {
        try {
          if (data.tag === 'first') {
            await gate.promise;
          }
          enforce(data.tag).isNotBlank();
        } finally {
          if (data.tag === 'first') {
            firstDone.release();
          }
        }
      });
    });
    const p1 = suite.run({ tag: 'first' });
    const p2 = suite.run({ tag: 'second' });
    const r2 = await p2;
    expect(r2.hasErrors('tag')).toBe(false);
    expect(suite.get().hasErrors('tag')).toBe(false);
    gate.release();
    await firstDone.promise;
    await flushAsyncWork();
    const r1 = await p1;
    expect(r1).toBe(r2);
    // The successor follows the normal path and resolves.
    await expect(p2).resolves.toBeDefined();
  });

  // 29. the ownership key is stable per suite: interleaved runs of a second
  // suite chain only within their own suite — B resolves with its own
  // result while A's first run adopts A's second run.
  it('29. interleaved suites chain independently', async () => {
    const gateA = createDeferred();
    const gateB = createDeferred();
    const createGatedSuite = (gate: Deferred, label: string) =>
      create((data: { tag: string }) => {
        test('tag', async () => {
          await gate.promise;
          enforce(data.tag).equals(label);
        });
      });
    const suiteA = createGatedSuite(gateA, 'a');
    const suiteB = createGatedSuite(gateB, 'b');
    const pA1 = suiteA.run({ tag: 'a' });
    const pB = suiteB.run({ tag: 'b' });
    // A second run of A chains only A's first run — B is untouched.
    const pA2 = suiteA.run({ tag: 'a' });
    gateA.release();
    const rA2 = await pA2;
    expect(rA2.hasErrors('tag')).toBe(false);
    expect(suiteA.get().hasErrors('tag')).toBe(false);
    const rA1 = await pA1;
    expect(rA1).toBe(rA2);
    // Suite B chains nothing: it resolves normally with its own result.
    gateB.release();
    const rB = await pB;
    expect(rB.hasErrors('tag')).toBe(false);
    expect(suiteB.get().hasErrors('tag')).toBe(false);
    await expect(pB).resolves.toBeDefined();
  });

  // 30. AbortSignal overload throws the documented V1 error (exact
  // message). Placed after all concurrency tests on purpose: throwing
  // inside the persisted `changed` wrapper leaves the ambient runtime
  // context pointing at this suite (the context primitive restores nothing
  // on throw), so later suites would otherwise execute against the wrong
  // runtime. Single-suite tests tolerate that; interleaved suites do not.
  it('30. suite.changed(field, { signal }) throws deferred-to-v2 in V1', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    const controller = new AbortController();
    expect(() =>
      suite.changed('a', { signal: controller.signal }),
    ).toThrowError(
      new Error('suite.changed({ signal: AbortSignal }) deferred to v2'),
    );
  });

  /** @deferred v2 — suite.changed with AbortSignal */
  it('deferred v2 — suite.changed(field, { signal: AbortSignal }) throws in V1', () => {
    const suite = create(() => {
      test('username', () => {});
    });
    const controller = new AbortController();
    expect(() =>
      suite.changed('username', { signal: controller.signal }),
    ).toThrowError(
      new Error('suite.changed({ signal: AbortSignal }) deferred to v2'),
    );
  });
});

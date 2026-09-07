/* eslint-disable sort-keys -- bench fixture order intentionally groups password deps */
import { bench, describe } from 'vitest';
import { create, test, enforce, group, skipWhen } from '../../src/vest';
import { each } from '../../src/isolates/each';
import { TFieldName, TGroupName } from '../../src/suiteResult/SuiteResultTypes';

// ──────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────
const travelersData = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    country: 'US',
    passportNumber: `P${i}`,
  }));

// ──────────────────────────────────────────────────────────────
// Group C — changed() vs only() vs run() — minimality proof (18)
// ──────────────────────────────────────────────────────────────
describe('changed() vs only() vs run() — minimality proof', () => {
  // ── Flat suite (C1–C5) ─────────────────────────────────────
  const flatSchema = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn($ => $.password),
    email: enforce.isString(),
  });

  const flatData = {
    password: 'abcdefgh',
    confirmPassword: 'abcdefgh',
    email: 'a@b.com',
  };

  const makeFlatSuite = () =>
    create(data => {
      test('password', () => {
        enforce(data.password).isString();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
      test('email', () => {
        enforce(data.email).isString();
      });
    }, flatSchema);

  // Pre-warmed reused suites — bench measures steady-state throughput,
  // not creation+warmup. Each bench reuses its own suite to avoid cross-bench focus leakage.
  const flatSuiteRun = makeFlatSuite();
  flatSuiteRun.run(flatData);
  const flatSuiteOnly = makeFlatSuite();
  flatSuiteOnly.run(flatData);
  const flatSuiteChangedPw = makeFlatSuite();
  flatSuiteChangedPw.run(flatData);
  const flatSuiteChangedConfirm = makeFlatSuite();
  flatSuiteChangedConfirm.run(flatData);
  const flatSuiteChangedEmail = makeFlatSuite();
  flatSuiteChangedEmail.run({ ...flatData, email: '' });

  bench(
    'C1 flat run() full [3/3 fields]',
    () => {
      flatSuiteRun.run(flatData);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C2 flat only(password) [1/3 fields]',
    () => {
      flatSuiteOnly.only('password').run(flatData);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C3 flat changed(password) [2/3 fields] password→confirm',
    () => {
      flatSuiteChangedPw
        .changed('password')
        .run({ ...flatData, password: 'newpass1' });
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C4 flat changed(confirmPassword) [1/3 fields] directionality',
    () => {
      flatSuiteChangedConfirm
        .changed('confirmPassword')
        .run({ ...flatData, confirmPassword: 'xyz' });
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C5 flat changed(email) [1/3 fields] unrelated, retains errors',
    () => {
      flatSuiteChangedEmail.changed('email').run(flatData);
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── Nested suite (C6–C7) ───────────────────────────────────
  const nestedSchema = enforce.shape({
    profile: enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    }),
    email: enforce.isString(),
  });

  const nestedData = {
    profile: { country: 'CA', state: '' },
    email: 'a@b.com',
  };

  const makeNestedSuite = () =>
    create(data => {
      test('profile.country', () => {
        enforce(data.profile.country).isString();
      });
      test('profile.state', () => {
        enforce(data.profile.state).isString();
      });
      test('email', () => {
        enforce(data.email).isString();
      });
    }, nestedSchema);

  const nestedSuiteRun = makeNestedSuite();
  nestedSuiteRun.run(nestedData);
  const nestedSuiteChanged = makeNestedSuite();
  nestedSuiteChanged.run(nestedData);

  bench(
    'C6 nested run() full [3/3 fields] profile.country+state+email',
    () => {
      nestedSuiteRun.run(nestedData);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C7 nested changed(profile.country) [2/3 fields] country→state',
    () => {
      nestedSuiteChanged
        .changed('profile.country')
        .run({ profile: { country: 'US', state: '' }, email: 'a@b.com' });
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── Reusable suite (C8–C9) ─────────────────────────────────
  const reuseAddress = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country),
  });
  const reuseSchema = enforce.shape({
    billing: reuseAddress,
    shipping: reuseAddress,
  });

  const reuseData = {
    billing: { country: 'US', state: 'CA' },
    shipping: { country: 'US', state: 'NY' },
  };

  const makeReuseSuite = () =>
    create(data => {
      group('billing' as TGroupName, () => {
        test('billing.country' as TFieldName, () => {
          enforce(data.billing.country).isString();
        });
        test('billing.state' as TFieldName, () => {
          enforce(data.billing.state).isString();
        });
      });
      group('shipping' as TGroupName, () => {
        test('shipping.country' as TFieldName, () => {
          enforce(data.shipping.country).isString();
        });
        test('shipping.state' as TFieldName, () => {
          enforce(data.shipping.state).isString();
        });
      });
    }, reuseSchema);

  const reuseSuiteRun = makeReuseSuite();
  reuseSuiteRun.run(reuseData);
  const reuseSuiteChanged = makeReuseSuite();
  reuseSuiteChanged.run(reuseData);

  bench(
    'C8 reusable run() full [4/4 fields] billing×2+shipping×2',
    () => {
      reuseSuiteRun.run(reuseData);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C9 reusable changed(billing.country) [2/4 fields] isolated, not shipping',
    () => {
      reuseSuiteChanged.changed('billing.country').run({
        billing: { country: 'CA', state: 'CA' },
        shipping: { country: 'US', state: 'NY' },
      });
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── Array suites (C10–C13) ─────────────────────────────────
  const travelerSchema = enforce.shape({
    country: enforce.isString(),
    passportNumber: enforce.isString().dependsOn($ => $.country),
  });
  const arraySchema = enforce.shape({
    travelers: enforce.isArrayOf(travelerSchema),
  });

  const makeArraySuite = (n: number) => {
    const data = { travelers: travelersData(n) };
    const suite = create(d => {
      each(d.travelers, (t, i) => {
        test(`travelers.${i}.country` as TFieldName, () => {
          enforce(t.country).isString();
        });
        test(`travelers.${i}.passportNumber` as TFieldName, () => {
          enforce(t.passportNumber).isString();
        });
      });
    }, arraySchema);
    suite.run(data);
    return { suite, data };
  };

  const arr3 = makeArraySuite(3);
  const arr100 = makeArraySuite(100);

  // Pre-create dedicated array suites for C10/C12 run baselines (reused, not recreated per iteration)
  const arr3Run = makeArraySuite(3);
  const arr100Run = makeArraySuite(100);
  // Pre-create changed fixtures to make run vs changed costs symmetric (no one-sided O(n) alloc)
  const arr100ChangedData = { travelers: travelersData(100) };
  arr100ChangedData.travelers[50] = { country: 'CA', passportNumber: 'P50' };

  bench(
    'C10 array(3) run() [6/6 fields] 3×country+passport',
    () => {
      arr3Run.suite.run(arr3Run.data);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C11 array(3) changed(travelers.1.country) [2/6 fields] same-item isolated',
    () => {
      arr3.suite.changed('travelers.1.country').run({
        travelers: [
          { country: 'US', passportNumber: 'P0' },
          { country: 'CA', passportNumber: 'P1' },
          { country: 'FR', passportNumber: 'P2' },
        ],
      });
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C12 array(100) run() [200/200 fields] 100×traveler',
    () => {
      arr100Run.suite.run(arr100Run.data);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C13 array(100) changed(travelers.50.country) [2/200 fields] ratio gate >10×',
    () => {
      arr100.suite.changed('travelers.50.country').run(arr100ChangedData);
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── Fan-out (C14–C15) ──────────────────────────────────────
  const fanoutSchema = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn($ => $.password),
    hint: enforce.isString().dependsOn($ => $.password),
    email: enforce.isString(),
  });

  const fanoutData = {
    password: 'abcdefgh',
    confirmPassword: 'abcdefgh',
    hint: 'ok',
    email: 'a@b.com',
  };

  const makeFanoutSuite = () =>
    create(data => {
      test('password', () => {
        enforce(data.password).isString();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
      test('hint', () => {
        enforce(data.hint).isString();
      });
      test('email', () => {
        enforce(data.email).isString();
      });
    }, fanoutSchema);

  const fanoutSuiteRun = makeFanoutSuite();
  fanoutSuiteRun.run(fanoutData);
  const fanoutSuiteChanged = makeFanoutSuite();
  fanoutSuiteChanged.run(fanoutData);

  bench(
    'C14 fan-out run() [4/4 fields] password+2deps+email',
    () => {
      fanoutSuiteRun.run(fanoutData);
    },
    { time: 1000, warmupTime: 500 },
  );

  bench(
    'C15 fan-out changed(password) [3/4 fields] deduped 1→2',
    () => {
      fanoutSuiteChanged
        .changed('password')
        .run({ ...fanoutData, password: 'newpass1' });
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── Chain non-transitive (C16) ─────────────────────────────
  const chainSchema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
    c: enforce.isString().dependsOn($ => $.b),
  });

  const chainData = { a: '1', b: '2', c: '3' };

  const makeChainSuite = () =>
    create(data => {
      test('a', () => {
        enforce(data.a).isString();
      });
      test('b', () => {
        enforce(data.b).isString();
      });
      test('c', () => {
        enforce(data.c).isString();
      });
    }, chainSchema);

  const chainSuiteRun = makeChainSuite();
  chainSuiteRun.run(chainData);
  const chainSuiteChanged = makeChainSuite();
  chainSuiteChanged.run(chainData);

  bench(
    'C16 chain changed(a) a→b→c non-transitive [2/3 fields] not c',
    () => {
      chainSuiteChanged.changed('a').run({ a: 'x', b: '2', c: '3' });
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── skipWhen (C17) ─────────────────────────────────────────
  const skipWhenSchema = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country),
  });

  const makeSkipWhenSuite = () =>
    create(data => {
      test('country', () => {
        enforce(data.country).isString();
      });
      skipWhen(data.country !== 'US', () => {
        test('state', () => {
          enforce(data.state).isString();
        });
      });
    }, skipWhenSchema);

  const skipWhenSuiteChanged = makeSkipWhenSuite();
  skipWhenSuiteChanged.run({ country: 'CA', state: '' });

  bench(
    'C17 skipWhen changed(country) CA→US flips state visibility [2 fields]',
    () => {
      skipWhenSuiteChanged.changed('country').run({ country: 'US', state: '' });
    },
    { time: 1000, warmupTime: 500 },
  );

  // ── Async dependent (C18) ──────────────────────────────────
  const asyncSchema = enforce.shape({
    organizationId: enforce.isString(),
    username: enforce.isString().dependsOn($ => $.organizationId),
  });

  const makeAsyncSuite = () =>
    create(data => {
      test('organizationId', () => {
        enforce(data.organizationId).isString();
      });
      test('username', async () => {
        const available = await Promise.resolve(data.username !== 'taken');
        enforce(available).isTruthy();
      });
    }, asyncSchema);

  const asyncSuiteChanged = makeAsyncSuite();
  asyncSuiteChanged.run({ organizationId: 'A', username: 'free' });

  bench(
    'C18 async changed(organizationId) reruns username [pending] [2/2 fields]',
    () => {
      asyncSuiteChanged
        .changed('organizationId')
        .run({ organizationId: 'B', username: 'free' });
    },
    { time: 1000, warmupTime: 500 },
  );
});

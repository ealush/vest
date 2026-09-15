/**
 * Packed-consumer strict typing fixtures (plan AC06/BB11).
 *
 * These fixtures prove the PACKED declarations (not workspace source aliases):
 * every import below resolves through `./node_modules` materialized from
 * `yarn pack` output by `setup-packed-consumer.mjs` (same pack-then-copy
 * pattern as `scripts/gate-schema-boundaries.js`).
 *
 * Minimum supported TypeScript: 5.4.5 (root devDependencies `typescript`).
 * Verified with: 5.9.3.
 *
 * Setup + typecheck (run from the repo root):
 *   node type-tests/consumer-typing/setup-packed-consumer.mjs
 *   yarn tsc -p type-tests/consumer-typing/tsconfig.esm.json   # ESM importer, NodeNext
 *   yarn tsc -p type-tests/consumer-typing/tsconfig.cjs.json   # CJS importer, Node16
 *
 * Rules for this file:
 * - SUPPORTED examples use no `as any` / `as never`.
 * - Every `@ts-expect-error` marks DELIBERATE MISUSE that must fail
 *   compilation; an unused directive fails the check, so negatives are
 *   self-policing.
 * - This `.mts` file and its `suite-consumer.cts` twin are intentionally
 *   identical (ESM `import` syntax typechecks under both module kinds) so the
 *   packed declarations are proven under both an ESM (NodeNext) and a CJS
 *   (Node16) importer. NOTE: both importers resolve the same packed `.d.cts`
 *   files — the manifests point every exports-map `types` condition at
 *   `.d.cts` (no entry references the shipped `.d.mts`; see README honest
 *   gaps). Keep the twins in sync when editing.
 */

import {
  create,
  enforce,
  group,
  include,
  only,
  optional,
  skip,
  test,
} from 'vest';
import type { Suite, SuiteResult } from 'vest';
import type { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';
import { enforce as n4sEnforce } from 'n4s';
import 'n4s/exports/date';
import 'n4s/exports/email';
import 'n4s/exports/isURL';
import classnames from 'vest/exports/classnames';
import { date } from 'vest/exports/date';
import debounce from 'vest/exports/debounce';
import { email } from 'vest/exports/email';
import { isURL } from 'vest/exports/isURL';
import { memo } from 'vest/exports/memo';
import { parse } from 'vest/exports/parser';
import { SuiteSerializer } from 'vest/exports/SuiteSerializer';

// ---------------------------------------------------------------------------
// Local assertion helpers (dependency-free: vitest is not a packed dep).
// ---------------------------------------------------------------------------

type IsAny<T> = 0 extends 1 & T ? true : false;

type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type AssertTrue<T extends true> = T;

declare function expectTypeOf<T>(actual?: T): {
  toEqualTypeOf: <U>(
    ...args: IsEqual<T, U> extends true ? [] : [typeMismatch: 'TYPE_MISMATCH']
  ) => void;
};

function assertTrue<T extends true>(): void {
  // Empty: the constraint is the assertion.
}

// ---------------------------------------------------------------------------
// 1. Native n4s schema suite.
// ---------------------------------------------------------------------------

const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
});

type UserData = { username: string; age: number };

const userSuite = create(data => {
  type CallbackDataIsExact = AssertTrue<IsEqual<typeof data, UserData>>;
  test('username', () => {
    enforce(data.username).isNotBlank();
  });
  test('age', () => {
    enforce(data.age).greaterThan(17);
  });
}, userSchema);

userSuite.run({ username: 'ann', age: 30 });
userSuite.validate({ username: 'ann', age: 30 });
userSuite.runStatic({ username: 'ann', age: 30 });

// @ts-expect-error - DELIBERATE MISUSE: payload is missing a required field
userSuite.run({ username: 'ann' });

// @ts-expect-error - DELIBERATE MISUSE: payload property types are wrong
userSuite.run({ username: 1, age: 'thirty' });

// @ts-expect-error - DELIBERATE MISUSE: schema suite run requires a payload
userSuite.run();

// Callback data is exactly the schema output:
const strictSuite = create(data => {
  // @ts-expect-error - DELIBERATE MISUSE: nonexistent property on schema data
  void data.nonexistent;
  test('username', () => {});
}, userSchema);
void strictSuite;

// ---------------------------------------------------------------------------
// 2. StandardSchemaV1<I, O>-annotated schema with distinct input/output.
// ---------------------------------------------------------------------------

type CoinInput = { label: string; amount: string };
type CoinOutput = { label: string; amount: number };

const coinSchema: StandardSchemaV1<CoinInput, CoinOutput> = {
  '~standard': {
    version: 1,
    vendor: 'consumer-typing-fixture',
    validate: (value: unknown) => {
      if (typeof value !== 'object' || value === null) {
        return { issues: [{ message: 'expected an object' }] };
      }
      const input = value as Record<string, unknown>;
      const rawLabel = input['label'];
      const rawAmount = input['amount'];
      if (typeof rawLabel !== 'string' || typeof rawAmount !== 'string') {
        return { issues: [{ message: 'invalid coin input' }] };
      }
      const amount = Number(rawAmount);
      if (Number.isNaN(amount)) {
        return { issues: [{ message: 'amount is not numeric' }] };
      }
      return { value: { label: rawLabel, amount } };
    },
  },
};

const coinSuite = create(data => {
  type CallbackReceivesOutput = AssertTrue<IsEqual<typeof data, CoinOutput>>;
  test('amount', () => {
    enforce(data.amount).greaterThan(0);
  });
}, coinSchema);

// Canonical-helper inference is EXACT and non-any.
type InferredCoinInput = StandardSchemaV1.InferInput<typeof coinSchema>;
type InferredCoinOutput = StandardSchemaV1.InferOutput<typeof coinSchema>;
type InferredInputExact = AssertTrue<IsEqual<InferredCoinInput, CoinInput>>;
type InferredOutputExact = AssertTrue<IsEqual<InferredCoinOutput, CoinOutput>>;
type InferredInputKnown = AssertTrue<
  IsAny<InferredCoinInput> extends false ? true : false
>;
type InferredOutputKnown = AssertTrue<
  IsAny<InferredCoinOutput> extends false ? true : false
>;

type CoinSuiteTypes = ReturnType<typeof coinSuite.get>['types'];
expectTypeOf<CoinSuiteTypes['input']>().toEqualTypeOf<CoinInput>();
expectTypeOf<CoinSuiteTypes['output']>().toEqualTypeOf<CoinOutput>();
type SuiteInputKnown = AssertTrue<
  IsAny<CoinSuiteTypes['input']> extends false ? true : false
>;
type SuiteOutputKnown = AssertTrue<
  IsAny<CoinSuiteTypes['output']> extends false ? true : false
>;

// run() takes the INPUT shape; the callback receives the OUTPUT shape.
coinSuite.run({ label: 'bus token', amount: '3.50' });

// @ts-expect-error - DELIBERATE MISUSE: run takes input, not output
coinSuite.run({ label: 'bus token', amount: 3.5 });

// @ts-expect-error - DELIBERATE MISUSE: payload is missing a required field
coinSuite.run({ label: 'bus token' });

// ---------------------------------------------------------------------------
// 3. Sync + async validators with a plain typed (schema-less) callback.
// ---------------------------------------------------------------------------

const asyncSuite = create((data: { username: string }) => {
  test('username', 'username is required', () => {
    enforce(data.username).isNotBlank();
  });
  test('username', async () => {
    await Promise.resolve();
    enforce(data.username).isString();
  });
  test(
    'username',
    () => {
      enforce(data.username).isString();
    },
    'static-key',
  );
});

asyncSuite.run({ username: 'ann' });

// @ts-expect-error - DELIBERATE MISUSE: payload is missing a required field
asyncSuite.run({});

// ---------------------------------------------------------------------------
// 4. Top-level (in-callback) focus hooks stay broad-string; skip takes
//    boolean, only takes false.
// ---------------------------------------------------------------------------

const hookSuite = create((data: { username: string; email: string }) => {
  test('username', () => {
    enforce(data.username).isNotBlank();
  });
  only('username');
  only(['username', 'email']);
  only(false);
  skip('email');
  skip(['username', 'email']);
  skip(true);
  skip(false);
  include('username').when('email');
  include('username').when(result => result.hasErrors('username'));
  optional('email');
  group('auth', () => {
    test('email', () => {});
  });
  void data;
});

hookSuite.run({ username: 'ann', email: 'ann@example.com' });

// ---------------------------------------------------------------------------
// 5. Suite-level selectors: broad field strings, strict groups.
// ---------------------------------------------------------------------------

const authSuite = create<{
  fields: 'username' | 'email';
  groups: 'auth' | 'profile';
}>(() => {});

// On the config-generic overload the callback type parameter keeps its
// default, so run() still takes a (loosely typed) data argument.
authSuite.run({ whatever: 1 });
type AuthRunArgs = Parameters<typeof authSuite.run>;
type AuthRunTakesData = AssertTrue<
  AuthRunArgs extends [data: unknown, ...args: unknown[]] ? true : false
>;
authSuite.remove('username');
authSuite.resetField('email');
authSuite.afterField('username', () => {});
authSuite.focus({ only: 'username', onlyGroup: 'auth' });
authSuite.focus({ skip: 'email', skipGroup: ['profile'] });
authSuite.focus({ onlyGroup: ['auth', 'profile'] });
authSuite.only('username');
authSuite.skip('email');
authSuite.test('email', () => {});
authSuite.include('username').when('email');
authSuite.optional('email');
authSuite.group('auth', () => {});
authSuite.get().hasErrors('username');
authSuite.get().getErrors('email');
authSuite.get().getErrorsByGroup('auth');
authSuite.get().hasErrorsByGroup('profile');
authSuite.get().hasErrorsByGroup('auth', 'username');
authSuite.get().isValidByGroup('profile', 'email');

// @ts-expect-error - DELIBERATE MISUSE: unknown group for focus.onlyGroup
authSuite.focus({ onlyGroup: 'nope' });

// @ts-expect-error - DELIBERATE MISUSE: unknown group for focus.skipGroup
authSuite.focus({ skipGroup: 'nope' });

// @ts-expect-error - DELIBERATE MISUSE: unknown group for suite.group
authSuite.group('nope', () => {});

// @ts-expect-error - DELIBERATE MISUSE: unknown group for result selectors
authSuite.get().getErrorsByGroup('nope');

// @ts-expect-error - DELIBERATE MISUSE: unknown field for result selectors
authSuite.get().hasErrors('nope');

// @ts-expect-error - DELIBERATE MISUSE: unknown field for result selectors
authSuite.get().getErrors('nope');

// @ts-expect-error - DELIBERATE MISUSE: include keeps the exact field vocabulary
authSuite.include('nope').when('username');

// ---------------------------------------------------------------------------
// 6. readonly string[] variables plug into changed/focus/only.
// ---------------------------------------------------------------------------

const changedFields: readonly string[] = ['username', 'age'];

userSuite.changed(changedFields).run({ username: 'ann', age: 30 });
userSuite.focus({ only: changedFields }).run({ username: 'ann', age: 30 });
userSuite.focus({ skip: changedFields }).run({ username: 'ann', age: 30 });
userSuite.only(changedFields).run({ username: 'ann', age: 30 });
userSuite.changed('username').run({ username: 'ann', age: 30 });
userSuite.changed(['username', 'age']).run({ username: 'ann', age: 30 });

// ---------------------------------------------------------------------------
// 7. Nested dotted selectors.
// ---------------------------------------------------------------------------

const profileSchema = enforce.shape({
  profile: enforce.shape({
    state: enforce.isString(),
  }),
});

const profileSuite = create(data => {
  test('profile', () => {
    enforce(data.profile.state).isString();
  });
}, profileSchema);

profileSuite.remove('profile.state');
profileSuite.resetField('profile.state');
profileSuite.focus({ only: 'profile.state' }).run({ profile: { state: 'CA' } });
profileSuite.run({ profile: { state: 'CA' } });
profileSuite.get().hasErrors('profile.state');
profileSuite.get().getErrors('profile.state');
profileSuite.get().isValid('profile.state');

// ---------------------------------------------------------------------------
// 8. Root-array suites.
// ---------------------------------------------------------------------------

const tagSchema = enforce.isArrayOf(enforce.isString());

const tagSuite = create(data => {
  type DataIsStringArray = AssertTrue<IsEqual<typeof data, string[]>>;
  test('length', () => {
    enforce(data.length).isNumber();
  });
}, tagSchema);

tagSuite.run(['a', 'b']);
tagSuite.changed('length').run(['a']);
tagSuite.focus({ only: 'length' }).run(['a', 'b']);

// @ts-expect-error - DELIBERATE MISUSE: root-array suite rejects object payloads
tagSuite.run({ tags: ['a'] });

// ---------------------------------------------------------------------------
// 9. Callbacks with extra args thread through run().
// ---------------------------------------------------------------------------

const extraSuite = create(
  (data: { username: string }, greeting: string, count: number) => {
    test('username', () => {
      enforce(data.username).isNotBlank();
    });
    void greeting;
    void count;
  },
  userSchema,
);

extraSuite.run({ username: 'ann', age: 30 }, 'hello', 3);

// @ts-expect-error - DELIBERATE MISUSE: extra args must match the callback tail
extraSuite.run({ username: 'ann', age: 30 }, 42);

// ---------------------------------------------------------------------------
// 10. valid-narrowing exposes value (valid) / issues (invalid).
// ---------------------------------------------------------------------------

const coinRes = coinSuite.run({ label: 'bus token', amount: '3.50' });

if (coinRes.valid === true) {
  expectTypeOf(coinRes.value).toEqualTypeOf<CoinOutput>();
} else if (coinRes.valid === false) {
  expectTypeOf(coinRes.issues.length).toEqualTypeOf<number>();
} else {
  type ValidIsNull = AssertTrue<IsEqual<typeof coinRes.valid, null>>;
}

// ---------------------------------------------------------------------------
// 11. afterEach/afterField chaining.
// ---------------------------------------------------------------------------

userSuite.afterField('username', () => {}).run({ username: 'ann', age: 30 });
userSuite.afterEach(() => {}).run({ username: 'ann', age: 30 });

userSuite
  .afterEach(() => {})
  .afterField('age', () => {})
  .changed('username')
  .focus({ only: 'age' })
  .only('username')
  .run({ username: 'ann', age: 30 });

// ---------------------------------------------------------------------------
// 12. Clear/empty selectors; skip:true typing.
// ---------------------------------------------------------------------------

userSuite.changed(undefined).run({ username: 'ann', age: 30 });
userSuite.changed([]).run({ username: 'ann', age: 30 });
userSuite.focus({}).run({ username: 'ann', age: 30 });
userSuite.focus({ skip: true }).run({ username: 'ann', age: 30 });
userSuite.focus({ skip: false }).run({ username: 'ann', age: 30 });

// ---------------------------------------------------------------------------
// 13. Invalid builder misuse.
// ---------------------------------------------------------------------------

// @ts-expect-error - DELIBERATE MISUSE: config-generic overload is schema-less
const badCombo = create<{ fields: 'username'; groups: 'auth' }>(
  () => {},
  userSchema,
);
void badCombo;

// @ts-expect-error - DELIBERATE MISUSE: changed takes no options object in V1
userSuite.changed('username', {});

// @ts-expect-error - DELIBERATE MISUSE: shape requires a rule map
enforce.shape('not-a-rule-map');

// ---------------------------------------------------------------------------
// 14. Escape hatch: create<null> stays open without `as any`.
// ---------------------------------------------------------------------------

const openSuite = create<null>(() => {
  test('anything', () => {});
});

openSuite.run({ whatever: 1 });
openSuite.focus({ only: 'x', onlyGroup: 'y' });
openSuite.get().hasErrors('anything');

// ---------------------------------------------------------------------------
// 15. Exported subpaths used by consumers.
// ---------------------------------------------------------------------------

// n4s rule-extension subpaths (side-effect imports registering matchers).
// Lazy (builder) form returns booleans via .test(); eager (chain) form throws
// on failure (proven patterns from n4s/src/exports/__tests__).
const emailOk: boolean = enforce.isEmail().test('ann@example.com');
const dateOk: boolean = enforce.isDate().test('2024-01-01');
const urlOk: boolean = enforce.isURL().test('https://vestjs.dev');
assertTrue<IsEqual<typeof emailOk, boolean>>();
assertTrue<IsEqual<typeof dateOk, boolean>>();
assertTrue<IsEqual<typeof urlOk, boolean>>();

enforce('ann@example.com').isEmail();
enforce('2024-01-01').isDate();
enforce('https://vestjs.dev').isURL();

// n4s root entry (mirrors the `vest` re-export).
const n4sCheck: boolean = n4sEnforce.isString().test('hello');
assertTrue<IsEqual<typeof n4sCheck, boolean>>();

// vest parser + serializer subpaths.
const parsed = parse(userSuite.get());
const parsedValid: boolean = parsed.valid('username');
const parsedTested: boolean = parsed.tested('username');
assertTrue<IsEqual<typeof parsedValid, boolean>>();
assertTrue<IsEqual<typeof parsedTested, boolean>>();

const serialized: string = SuiteSerializer.serialize(userSuite);
assertTrue<IsEqual<typeof serialized, string>>();

// vest utility subpaths.
const memoized = memo(() => 42, []);
void memoized;
const cn = classnames(userSuite.get(), { invalid: 'is-invalid' });
const cls: string = cn('username');
assertTrue<IsEqual<typeof cls, string>>();
const debounced = debounce(() => {}, 250);
void debounced;

// Namespace re-export subpaths resolve (they carry the n4s matcher entries).
void email;
void date;
void isURL;

// Root type exports resolve from the packed entry.
type PinnedBroadSuite = Suite<string, string>;
type PinnedResult = SuiteResult<'username' | 'age', 'auth'>;
function usePinnedTypes(
  suite: PinnedBroadSuite | null,
  result: PinnedResult | null,
): void {
  void suite;
  void result;
}
usePinnedTypes(null, null);

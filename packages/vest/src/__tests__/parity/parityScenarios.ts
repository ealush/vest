/* eslint-disable max-lines */
import { compose } from 'n4s';

import { SuiteSerializer } from '../../exports/SuiteSerializer';
import {
  create,
  each,
  enforce,
  group,
  include,
  mode,
  Modes,
  omitWhen,
  only,
  optional,
  skip,
  skipWhen,
  test,
  warn,
} from '../../vest';

/**
 * Behavior parity scenarios.
 *
 * Each scenario drives a suite through a fixed sequence of public API calls
 * and records a normalized summary after every step. parity.test.ts compares
 * the recording to parity.golden.json, captured on `latest`. A change in any
 * scenario means observable Vest behavior changed: update the golden only in
 * a PR that intends that change, and review the diff line by line.
 *
 * Scenarios use public API only and never depend on timers.
 */
export type ParityStep = Record<string, unknown>;
export type ParityScenario = {
  readonly name: string;
  readonly run: () => ParityStep[] | Promise<ParityStep[]>;
};

type Summarizable = {
  readonly value?: unknown;
  isValid: () => boolean;
  isPending: () => boolean;
};

/** JSON-safe summary of a suite result, without functions or timestamps. */
export function summarize(suiteResult: object, label = ''): ParityStep {
  const result = suiteResult as Summarizable;
  const plain = JSON.parse(
    JSON.stringify(result, (key, value) => {
      if (typeof value === 'function') return undefined;
      if (key === 'time') return undefined;
      if (value instanceof Date) return `Date(${value.toISOString()})`;
      return value;
    }),
  ) as ParityStep;
  return {
    label,
    ...plain,
    isValid: result.isValid(),
    isPending: result.isPending(),
    value: toJson(result.value),
  };
}

function toJson(value: unknown): unknown {
  return value === undefined
    ? '<undefined>'
    : JSON.parse(JSON.stringify(value));
}

function deferred() {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}

function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

type Fields = Record<string, unknown>;

const isBlank = (value: unknown) => {
  enforce(value as string).isNotBlank();
};

export const parityScenarios: ParityScenario[] = [
  {
    name: 'plain: passing and failing tests',
    run: () => {
      const suite = create((data: Fields) => {
        test('username', 'Username is required', () => isBlank(data.username));
        test('email', 'Email is required', () => isBlank(data.email));
      });
      return [
        summarize(suite.run({ username: '', email: '' }), 'both fail'),
        summarize(suite.run({ username: 'a', email: '' }), 'one fixed'),
        summarize(suite.run({ username: 'a', email: 'b' }), 'all pass'),
      ];
    },
  },
  {
    name: 'plain: warnings',
    run: () => {
      const suite = create((data: Fields) => {
        test('password', 'Weak password', () => {
          warn();
          enforce(String(data.password)).longerThan(8);
        });
        test('password', 'Required', () => isBlank(data.password));
      });
      return [
        summarize(suite.run({ password: 'short' }), 'warns'),
        summarize(suite.run({ password: '' }), 'warns and fails'),
        summarize(suite.run({ password: 'long enough password' }), 'clean'),
      ];
    },
  },
  {
    name: 'modes: default eager stops a field at its first failure',
    run: () => {
      const suite = create((data: Fields) => {
        test('a', 'first', () => isBlank(data.a));
        test('a', 'second', () => false);
        test('b', 'other', () => false);
      });
      return [summarize(suite.run({ a: '' }))];
    },
  },
  {
    name: 'modes: ALL runs every test',
    run: () => {
      const suite = create((data: Fields) => {
        mode(Modes.ALL);
        test('a', 'first', () => isBlank(data.a));
        test('a', 'second', () => false);
      });
      return [summarize(suite.run({ a: '' }))];
    },
  },
  {
    name: 'modes: ONE stops the suite at the first failure',
    run: () => {
      const suite = create((data: Fields) => {
        mode(Modes.ONE);
        test('a', 'first', () => isBlank(data.a));
        test('b', 'second', () => false);
      });
      return [summarize(suite.run({ a: '' }))];
    },
  },
  {
    name: 'focus: suite.only() sequence keeps unfocused results',
    run: () => {
      const suite = create((data: Fields) => {
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b fails', () => isBlank(data.b));
      });
      return [
        summarize(suite.run({ a: '', b: '' }), 'full'),
        summarize(suite.only('a').run({ a: 'ok', b: '' }), 'only a'),
        summarize(suite.only(['b']).run({ a: 'ok', b: 'ok' }), 'only b'),
      ];
    },
  },
  {
    name: 'focus: only() inside the callback',
    run: () => {
      const suite = create((data: Fields, field?: string) => {
        only(field);
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b fails', () => isBlank(data.b));
      });
      return [
        summarize(suite.run({ a: '', b: '' }), 'full'),
        summarize(suite.run({ a: 'ok', b: '' }, 'a'), 'only a'),
      ];
    },
  },
  {
    name: 'focus: focus({ skip }) keeps the skipped result',
    run: () => {
      const suite = create((data: Fields) => {
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b fails', () => isBlank(data.b));
      });
      return [
        summarize(suite.run({ a: '', b: '' }), 'full'),
        summarize(suite.focus({ skip: 'a' }).run({ a: '', b: 'ok' }), 'skip a'),
        summarize(
          suite.focus({ skip: ['a', 'b'] }).run({ a: 'ok', b: 'ok' }),
          'skip both',
        ),
      ];
    },
  },
  {
    name: 'focus: skip() inside the callback',
    run: () => {
      const suite = create((data: Fields, skipped?: string) => {
        skip(skipped);
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b fails', () => isBlank(data.b));
      });
      return [
        summarize(suite.run({ a: '', b: '' }), 'full'),
        summarize(suite.run({ a: '', b: 'ok' }, 'a'), 'skip a'),
      ];
    },
  },
  {
    name: 'focus: only and skip together',
    run: () => {
      const suite = create((data: Fields) => {
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b fails', () => isBlank(data.b));
        test('c', 'c fails', () => isBlank(data.c));
      });
      return [
        summarize(suite.run({ a: '', b: '', c: '' }), 'full'),
        summarize(
          suite.focus({ only: ['a', 'b'], skip: 'b' }).run({ a: 'ok' }),
          'only a,b skip b',
        ),
      ];
    },
  },
  {
    name: 'groups: named groups and group skip(true)',
    run: () => {
      const suite = create((data: Fields) => {
        group('signup', () => {
          test('email', 'email required', () => isBlank(data.email));
        });
        group('profile', () => {
          skip(Boolean(data.skipProfile));
          test('name', 'name required', () => isBlank(data.name));
        });
      });
      return [
        summarize(suite.run({ email: '', name: '' }), 'full'),
        summarize(
          suite.run({ email: 'a', name: '', skipProfile: true }),
          'profile skipped',
        ),
      ];
    },
  },
  {
    name: 'groups: onlyGroup and skipGroup',
    run: () => {
      const suite = create((data: Fields) => {
        group('g1', () => {
          test('a', 'a fails', () => isBlank(data.a));
        });
        group('g2', () => {
          test('b', 'b fails', () => isBlank(data.b));
        });
        test('c', 'c fails', () => isBlank(data.c));
      });
      return [
        summarize(suite.run({}), 'full'),
        summarize(suite.focus({ onlyGroup: 'g1' }).run({ a: 'ok' }), 'g1'),
        summarize(suite.focus({ skipGroup: 'g2' }).run({ a: 'ok', c: 'ok' })),
      ];
    },
  },
  {
    name: 'conditions: skipWhen keeps previous results',
    run: () => {
      const suite = create((data: Fields) => {
        test('username', 'required', () => isBlank(data.username));
        skipWhen(Boolean(data.offline), () => {
          test('username', 'taken', () => data.username !== 'taken');
        });
      });
      return [
        summarize(suite.run({ username: 'taken' }), 'online'),
        summarize(suite.run({ username: 'taken', offline: true }), 'offline'),
      ];
    },
  },
  {
    name: 'conditions: omitWhen removes tests from the result',
    run: () => {
      const suite = create((data: Fields) => {
        omitWhen(!data.wantsNewsletter, () => {
          test('email', 'required for newsletter', () => isBlank(data.email));
        });
        test('name', 'required', () => isBlank(data.name));
      });
      return [
        summarize(suite.run({ wantsNewsletter: true, name: 'a' }), 'included'),
        summarize(suite.run({ wantsNewsletter: false, name: 'a' }), 'omitted'),
      ];
    },
  },
  {
    name: 'optional: blank optional fields stay valid',
    run: () => {
      const suite = create((data: Fields) => {
        optional('nickname');
        test('nickname', 'too short', () => {
          enforce(String(data.nickname ?? '')).longerThan(2);
        });
        test('name', 'required', () => isBlank(data.name));
      });
      return [
        summarize(suite.run({ name: 'a' }), 'nickname untested'),
        summarize(suite.run({ name: 'a', nickname: 'x' }), 'nickname bad'),
      ];
    },
  },
  {
    name: 'optional: custom optional condition',
    run: () => {
      const suite = create((data: Fields) => {
        optional({ phone: () => !data.wantsSms });
        test('phone', 'required', () => isBlank(data.phone));
      });
      return [
        summarize(suite.run({ wantsSms: false }), 'not needed'),
        summarize(suite.run({ wantsSms: true }), 'needed'),
      ];
    },
  },
  {
    name: 'include: when() pulls a field into focus',
    run: () => {
      const suite = create((data: Fields, field?: string) => {
        only(field);
        include('confirm').when('password');
        test('password', 'required', () => isBlank(data.password));
        test('confirm', 'must match', () => {
          enforce(data.confirm).equals(data.password);
        });
      });
      return [
        summarize(suite.run({ password: 'a', confirm: 'b' }, 'password')),
      ];
    },
  },
  {
    name: 'each: keyed tests follow their item across reorders',
    run: () => {
      const suite = create((data: { rows: { id: string; v: string }[] }) => {
        each(data.rows, (row, index) => {
          test(`rows.${index}.v`, 'required', () => isBlank(row.v), row.id);
        });
        test('other', () => {});
      });
      return [
        summarize(
          suite.run({
            rows: [
              { id: 'a', v: '' },
              { id: 'b', v: 'ok' },
            ],
          }),
          'initial',
        ),
        summarize(
          suite.run({
            rows: [
              { id: 'b', v: 'ok' },
              { id: 'a', v: '' },
            ],
          }),
          'reordered',
        ),
        summarize(
          suite.only('other').run({
            rows: [
              { id: 'a', v: '' },
              { id: 'b', v: 'ok' },
            ],
          }),
          'reordered while focused out',
        ),
      ];
    },
  },
  {
    name: 'async: awaited results',
    run: async () => {
      const suite = create((data: Fields) => {
        test('username', 'taken', async () => {
          await flush();
          enforce(data.username).notEquals('taken');
        });
        test('email', 'required', () => isBlank(data.email));
      });
      const pending = suite.run({ username: 'taken', email: '' });
      const steps = [summarize(pending, 'sync part')];
      steps.push(summarize(await pending, 'settled'));
      steps.push(summarize(await suite.run({ username: 'free', email: 'a' })));
      return steps;
    },
  },
  {
    name: 'async: a newer run replaces pending work',
    run: async () => {
      const gate = deferred();
      const suite = create((data: Fields) => {
        test('username', 'taken', async () => {
          if (data.slow) await gate.promise;
          enforce(data.username).notEquals('taken');
        });
      });
      suite.run({ username: 'taken', slow: true });
      const latest = await suite.run({ username: 'free' });
      gate.release();
      await flush();
      return [summarize(latest, 'latest'), summarize(suite.get(), 'after')];
    },
  },
  {
    name: 'lifecycle: resetField, remove and reset',
    run: () => {
      const suite = create((data: Fields) => {
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b fails', () => isBlank(data.b));
      });
      const steps = [summarize(suite.run({}), 'full')];
      suite.resetField('a');
      steps.push(summarize(suite.get(), 'resetField a'));
      suite.remove('b');
      steps.push(summarize(suite.get(), 'remove b'));
      suite.run({});
      suite.reset();
      steps.push(summarize(suite.get(), 'reset'));
      return steps;
    },
  },
  {
    name: 'lifecycle: resetField while a test is pending',
    run: async () => {
      const gate = deferred();
      const suite = create(() => {
        test('a', 'late failure', async () => {
          await gate.promise;
          throw new Error();
        });
        test('b', 'b fails', () => false);
      });
      suite.run();
      suite.resetField('a');
      gate.release();
      await flush();
      return [summarize(suite.get())];
    },
  },
  {
    name: 'callbacks: afterEach and afterField',
    run: async () => {
      const calls: string[] = [];
      const suite = create((data: Fields) => {
        test('a', 'a fails', () => isBlank(data.a));
        test('b', 'b async', async () => {
          await flush();
          isBlank(data.b);
        });
      });
      const result = await suite
        .afterEach(() => calls.push('each'))
        .afterField('b', () => calls.push('field b'))
        .run({ a: '', b: '' });
      return [{ calls }, summarize(result)];
    },
  },
  {
    name: 'serialization: resume restores verdicts',
    run: () => {
      const make = () =>
        create((data: Fields) => {
          test('a', 'a fails', () => isBlank(data.a));
          test('b', 'b fails', () => isBlank(data.b));
        });
      const source = make();
      source.run({ a: '', b: 'ok' });
      const target = make();
      SuiteSerializer.resume(target, SuiteSerializer.serialize(source));
      return [
        summarize(target.get(), 'resumed'),
        summarize(target.only('b').run({ a: '', b: '' }), 'focused after'),
      ];
    },
  },
  {
    name: 'static: runStatic is stateless',
    run: () => {
      const suite = create((data: Fields) => {
        test('a', 'a fails', () => isBlank(data.a));
      });
      return [
        summarize(suite.runStatic({ a: '' }), 'static fail'),
        summarize(suite.runStatic({ a: 'ok' }), 'static pass'),
        summarize(suite.get(), 'suite untouched'),
      ];
    },
  },
  {
    name: 'schema: full runs report errors and parsed value',
    run: () => {
      const suite = create(
        () => {},
        enforce.shape({
          name: enforce.isString(),
          age: enforce.isNumeric().toNumber(),
        }),
      );
      return [
        summarize(suite.run({ name: 'a', age: '7' }), 'valid'),
        summarize(suite.run({ name: 1, age: '7' } as never), 'invalid name'),
      ];
    },
  },
  {
    name: 'schema: callback data with parsers',
    run: () => {
      const seen: unknown[] = [];
      const suite = create(
        (data: { age: number }) => {
          seen.push(typeof data.age);
          test('age', 'adult', () => {
            enforce(data.age).greaterThanOrEquals(18);
          });
        },
        enforce.shape({ age: enforce.isNumeric().toNumber() }),
      );
      const steps = [
        summarize(suite.run({ age: '20' } as never), 'full'),
        summarize(suite.only('age').run({ age: '10' } as never), 'only'),
      ];
      return [{ seen }, ...steps];
    },
  },
  {
    name: 'schema: only() after a failing full run',
    run: () => {
      const suite = create(
        (data: Fields) => {
          test('a', 'a fails', () => isBlank(data.a));
        },
        enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
      );
      return [
        summarize(suite.run({ a: 'x', b: 1 } as never), 'full'),
        summarize(suite.only('a').run({ a: 'x', b: 1 } as never), 'only a'),
        summarize(suite.only('b').run({ a: 'x', b: 'y' } as never), 'only b'),
      ];
    },
  },
  {
    name: 'schema: focus({ skip }) after a failing full run',
    run: () => {
      const suite = create(
        () => {},
        enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
      );
      return [
        summarize(suite.run({ a: 'x', b: 1 } as never), 'full'),
        summarize(suite.focus({ skip: 'b' }).run({ a: 'x', b: 1 } as never)),
      ];
    },
  },
  {
    name: 'schema: nested shapes and focus',
    run: () => {
      const suite = create(
        () => {},
        enforce.shape({
          profile: enforce.shape({ name: enforce.isString() }),
          other: enforce.isString(),
        }),
      );
      return [
        summarize(
          suite.run({ profile: { name: 1 }, other: 'x' } as never),
          'full',
        ),
        summarize(
          suite.only('profile').run({ profile: { name: 'ok' }, other: 'x' }),
          'only profile',
        ),
      ];
    },
  },
  {
    name: 'schema: loose, partial and isArrayOf',
    run: () => {
      const suite = create(
        () => {},
        enforce.shape({
          meta: enforce.loose({ id: enforce.isString() }),
          prefs: enforce.partial({ theme: enforce.isString() }),
          tags: enforce.isArrayOf(enforce.isString()),
        }),
      );
      return [
        summarize(
          suite.run({ meta: { id: 'x', extra: 1 }, prefs: {}, tags: ['a'] }),
          'valid',
        ),
        summarize(
          suite.run({ meta: { id: 'x' }, prefs: {}, tags: ['a', 2] } as never),
          'bad tag',
        ),
      ];
    },
  },
  {
    name: 'schema: root failure on non-object input',
    run: () => {
      const suite = create(() => {}, enforce.shape({ a: enforce.isString() }));
      return [
        summarize(suite.run(null as never), 'null'),
        summarize(suite.run({ a: 'x' }), 'valid'),
      ];
    },
  },
  {
    name: 'schema: compose() as the suite schema',
    run: () => {
      // compose() is a generic rule, not a shape: the suite is typed loosely.
      const suite = create(
        () => {},
        compose(enforce.shape({ a: enforce.isNumber() })) as never,
      ) as unknown as { run: (data: unknown) => object };
      return [
        summarize(suite.run({ a: 'x' }), 'invalid'),
        summarize(suite.run({ a: 1 }), 'valid'),
      ];
    },
  },
  {
    name: 'schema: Standard Schema validate on the suite',
    run: async () => {
      const suite = create(
        (data: Fields) => {
          test('a', 'a fails', () => isBlank(data.a));
        },
        enforce.shape({ a: enforce.isString() }),
      );
      const standard = suite['~standard'];
      return [
        {
          valid: await standard.validate({ a: 'x' }),
          invalid: await standard.validate({ a: '' }),
        },
      ];
    },
  },
];

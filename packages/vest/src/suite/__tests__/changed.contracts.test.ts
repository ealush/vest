import { compose } from 'n4s';
import { withResolvers } from 'vest-utils';
import { expect, it, vi } from 'vitest';

import '../../exports/relationships';
import { memo } from '../../exports/memo';
import {
  create,
  enforce,
  test,
  group,
  include,
  omitWhen,
  skipWhen,
  optional,
  warn,
  mode,
  Modes,
} from '../../vest';

it('preserves sibling context, root context and field metadata', () => {
  const contexts: unknown[] = [];
  const schema = enforce.shape({
    password: enforce.isString(),
    confirm: enforce
      .condition((value: unknown) => {
        const context = enforce.context();
        contexts.push([
          context?.meta.key,
          context?.value,
          context?.parent()?.value,
        ]);
        return value === context?.parent()?.value.password;
      })
      .dependsOn($ => $.password),
    nested: enforce
      .shape({
        confirm: enforce.condition(
          (value: unknown) =>
            value === enforce.context()?.parent()?.parent()?.value.password,
        ),
      })
      .dependsOn($ => $.password),
  });
  const suite = create(() => test('password', () => true), schema);
  const data = { password: 'x', confirm: 'x', nested: { confirm: 'x' } };
  expect(suite.run(data).hasErrors()).toBe(false);
  expect(suite.changed('password').run(data).hasErrors()).toBe(false);
  expect(contexts[1]).toEqual(contexts[0]);
  expect(enforce.context()).toBeUndefined();
});

it.each([Modes.EAGER, Modes.ALL, Modes.ONE])(
  'preserves %s failure policy within the expanded selection',
  selectedMode => {
    const calls: string[] = [];
    const suite = create(
      () => {
        mode(selectedMode);
        for (const name of ['a', 'b', 'c']) {
          test(name, () => {
            calls.push(name + '1');
            return false;
          });
          test(name, () => {
            calls.push(name + '2');
            return false;
          });
        }
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
        c: enforce.isString(),
      }),
    );
    suite.changed('a').run({ a: 'x', b: 'x', c: 'x' });
    expect(calls).toEqual(
      selectedMode === Modes.ALL
        ? ['a1', 'a2', 'b1', 'b2']
        : selectedMode === Modes.ONE
          ? ['a1']
          : ['a1', 'b1'],
    );
  },
);

it('retains memo verdicts until their declared inputs change', () => {
  const checked = vi.fn();
  const suite = create(
    (data: { a: string; b: string }) => {
      test('a', () => true);
      memo(
        () =>
          test('b', () => {
            checked(data.a);
            return data.a === data.b;
          }),
        [data.a, data.b],
      );
    },
    enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    }),
  );
  suite.run({ a: 'x', b: 'x' });
  suite.changed('a').run({ a: 'x', b: 'x' });
  expect(checked).toHaveBeenCalledTimes(1);
  expect(suite.changed('a').run({ a: 'y', b: 'x' }).hasErrors('b')).toBe(true);
  expect(checked).toHaveBeenCalledTimes(2);
});

it('cancels superseded dependent tests while unrelated pending tests and completion hooks settle', async () => {
  const jobs: Array<
    ReturnType<typeof withResolvers<void>> & {
      name: string;
      signal: AbortSignal;
    }
  > = [];
  const suite = create(
    () => {
      for (const name of ['a', 'b', 'c'])
        test(name, name + ' failed', ({ signal }) => {
          const deferred = withResolvers<void>();
          jobs.push({ ...deferred, name, signal });
          return deferred.promise;
        });
    },
    enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString(),
    }),
  );
  const data = { a: 'x', b: 'x', c: 'x' };
  suite.run(data);
  const field = vi.fn();
  const each = vi.fn();
  const pending = suite
    .changed('a')
    .afterField('b', field)
    .afterEach(each)
    .run(data);
  expect(jobs.map(job => job.name)).toEqual(['a', 'b', 'c', 'a', 'b']);
  expect(jobs.map(job => job.signal.aborted)).toEqual([
    true,
    true,
    false,
    false,
    false,
  ]);
  jobs[0].reject(new Error('stale'));
  jobs[1].reject(new Error('stale'));
  jobs[3].resolve();
  jobs[4].resolve();
  await vi.waitFor(() => expect(field).toHaveBeenCalledOnce());
  expect(each).toHaveBeenCalledTimes(3); // initial sync completion and both new async tests
  jobs[2].reject(new Error('retained'));
  const result = await pending;
  expect(each).toHaveBeenCalledTimes(4);
  expect(result.hasErrors('a')).toBe(false);
  expect(result.hasErrors('b')).toBe(false);
  expect(result.getErrors('c')).toEqual(['c failed']);
});

it('runs composed-root dependent user tests as well as schema validation', () => {
  const calls: string[] = [];
  const schema = compose(
    enforce.loose({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    }),
  );
  const suite = create(() => {
    test('a', () => void calls.push('a'));
    test('b', () => void calls.push('b'));
  }, schema);
  suite.changed('a').run({ a: 'x', b: 'x' });
  expect(calls).toEqual(['a', 'b']);
});

it('preserves custom root messages by validating the decorated schema as a whole', () => {
  const suite = create(
    () => {},
    enforce
      .shape({ a: enforce.isString(), b: enforce.isString() })
      .message('Invalid input'),
  );
  expect(
    suite
      .changed('a')
      .run({ a: 1, b: 'x' } as never)
      .getErrors('a'),
  ).toEqual(['Invalid input']);
});

it.each(['dot', 'bracket'])('applies ancestor skip to %s paths', syntax => {
  const call = vi.fn();
  const name = syntax === 'dot' ? 'rows.0.a' : 'rows[0].a';
  const suite = create(
    () => test(name, call),
    enforce.shape({
      rows: enforce.isArrayOf(enforce.shape({ a: enforce.isString() })),
    }),
  );
  suite
    .changed(name)
    .focus({ skip: 'rows' })
    .run({ rows: [{ a: 'x' }] });
  expect(call).not.toHaveBeenCalled();
});

it('applies bracket skip to a canonical dotted dependent name', () => {
  const call = vi.fn();
  const suite = create(
    () => test('rows.0.b', call),
    enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          a: enforce.isString(),
          b: enforce.isString().dependsOn($ => $.a),
        }),
      ),
    }),
  );
  suite
    .changed('rows[0].a')
    .focus({ skip: 'rows[0].b' as never })
    .run({ rows: [{ a: 'x', b: 'x' }] });
  expect(call).not.toHaveBeenCalled();
});

it.each(['partial', 'compose', 'chained'])(
  'runs no schema validators for empty or fully skipped %s selections',
  kind => {
    const called = vi.fn(() => true);
    enforce.extend({ relationshipContainer: (_value: unknown) => true });
    const fields = { a: enforce.condition(called) };
    const schema =
      kind === 'partial'
        ? enforce.partial(fields)
        : kind === 'compose'
          ? compose(enforce.shape(fields))
          : enforce.shape(fields).relationshipContainer();
    const suite = create(() => {}, schema);
    suite.changed([]).run({ a: 'x' });
    suite.changed('a').focus({ skip: 'a' }).run({ a: 'x' });
    expect(called).not.toHaveBeenCalled();
  },
);

it('retains skipped fallback schema errors when another field fails first', () => {
  const suite = create(
    () => {},
    enforce.partial({ a: enforce.isString(), b: enforce.isString() }),
  );
  expect(suite.run({ a: 'x', b: 1 } as never).hasErrors('b')).toBe(true);
  const result = suite
    .changed('a')
    .focus({ skip: 'b' })
    .run({ a: 1, b: 1 } as never);
  expect(result.hasErrors('a')).toBe(true);
  expect(result.hasErrors('b')).toBe(true);
});

it('preserves data accessor semantics during validation', () => {
  const schema = enforce.shape({ a: enforce.isString().trim() });
  const data = Object.defineProperty({}, 'a', {
    enumerable: true,
    get: () => ' x ',
  });
  const suite = create(() => test('a', () => true), schema);
  expect(
    suite
      .only('a')
      .run(data as never)
      .hasErrors(),
  ).toBe(false);
  expect(suite.changed('a').run(data as never).value).toEqual({ a: 'x' });
});

it('snapshots validated-only output before the callback can mutate or extend its input', () => {
  const suite = create(
    data => {
      data.a = 'modified';
      Object.assign(data, { unchecked: true });
      test('a', () => true);
    },
    enforce.shape({ a: enforce.isString().trim() }),
  );
  const result = suite.changed('a').run({ a: ' original ' });
  expect(result.value).toEqual({ a: 'original' });
  expect(result.types?.output).toEqual({ a: 'original' });
  expect(result.run.data.parsed).toEqual({ a: 'original' });
});

it('rejects unsupported Standard Schema-only schemas instead of accepting raw data', () => {
  const schema = {
    '~standard': {
      version: 1,
      vendor: 'foreign',
      validate: () => ({ issues: [{ message: 'invalid' }] }),
    },
  };
  const suite = create(() => test('a', () => true), schema);
  expect(() => suite.changed('a').run({ a: 1 })).toThrow(
    /synchronous schema.*parse\(\).*run\(\)/,
  );
});

it('rejects asynchronous schema parsing as an unsupported setup', () => {
  const suite = create(() => {}, { parse: async (data: unknown) => data });
  expect(() => suite.changed('a').run({ a: 'x' })).toThrow(
    /asynchronous schema parsing/,
  );
});

it('handles rejected asynchronous parsing before reporting the unsupported setup', async () => {
  const suite = create(() => {}, {
    parse: async () => {
      throw new TypeError('invalid data');
    },
  });
  expect(() => suite.changed('a').run({ a: 'x' })).toThrow(
    /asynchronous schema parsing/,
  );
  await Promise.resolve();
});

it('rejects asynchronous run methods and preserves foreign method receivers', async () => {
  const run = vi.fn(async () => {
    throw new Error('invalid data');
  });
  const suite = create(() => {}, { run });
  expect(() => suite.changed('a').run({ a: 1 })).toThrow(
    /asynchronous schema parsing/,
  );
  expect(run).toHaveBeenCalledOnce();
  await Promise.resolve();
  const schema = {
    multiplier: 2,
    parse(data: { a: number }) {
      return { a: data.a * this.multiplier };
    },
    run(data: { a: number }) {
      return { pass: data.a === this.multiplier, type: data };
    },
  };
  const sync = create(() => test('a', () => true), schema);
  expect(sync.changed('a').run({ a: 1 }).valid).toBe(true);
});

it('rejects asynchronous parse before invoking a synchronous run fallback', () => {
  const run = vi.fn(() => ({ pass: true }));
  const suite = create(() => {}, { parse: async () => ({}), run });
  expect(() => suite.changed('a').run({ a: 1 })).toThrow(
    /asynchronous schema parsing/,
  );
  expect(run).not.toHaveBeenCalled();
});

it('uses ancestor relationships without making expansion transitive', () => {
  const calls: string[] = [];
  const suite = create(
    () => {
      for (const name of ['box.a', 'summary', 'next'])
        test(name, () => void calls.push(name));
    },
    enforce.shape({
      box: enforce.shape({ a: enforce.isString() }),
      summary: enforce.isString().dependsOn($ => $.box),
      next: enforce.isString().dependsOn($ => $.summary),
    }),
  );
  suite.changed('box.a').run({ box: { a: 'x' }, summary: 'x', next: 'x' });
  expect(calls).toEqual(['box.a', 'summary']);
});

it('preserves inclusion, groups, conditions, optional tests and warnings', () => {
  const calls: string[] = [];
  const suite = create(() => {
    include('included').when('a');
    optional({ optional: true });
    group('selected', () => {
      test('a', () => void calls.push('a'));
      test('included', () => void calls.push('included'));
      skipWhen(true, () => test('skipped', () => void calls.push('skipped')));
      omitWhen(true, () => test('omitted', () => void calls.push('omitted')));
      test('optional', () => false);
      test('warning', () => {
        warn();
        return false;
      });
    });
    group('other', () => test('a', () => void calls.push('other')));
  });
  const result = suite
    .changed(['a', 'skipped', 'omitted', 'optional', 'warning'])
    .focus({ onlyGroup: 'selected' })
    .run();
  expect(calls).toEqual(['a', 'included']);
  expect(result.hasErrors('omitted')).toBe(false);
  expect(result.hasErrors('optional')).toBe(false);
  expect(result.hasWarnings('warning')).toBe(true);
});

it('preserves group-filtered schema reporting without accepting a failed schema', () => {
  const rule = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
  const suite = create(
    () => group('auth', () => test('a', () => true)),
    enforce.shape({ a: enforce.condition(rule) }),
  );
  const focused = suite.changed('a').focus({ onlyGroup: 'auth' });
  const failed = focused.run({ a: 1 });
  expect(rule).toHaveBeenCalledOnce();
  expect(failed.valid).toBe(false);
  expect(failed.errors).toEqual([]);
  expect(failed.issues).toEqual([]);
  expect(failed).not.toHaveProperty('value');
  const passed = focused.run({ a: 1 });
  expect(rule).toHaveBeenCalledTimes(2);
  expect(passed.valid).toBe(true);
  expect(passed.value).toEqual({ a: 1 });
});

it('keeps independent changed builders and lifecycle removals isolated', () => {
  const calls: string[] = [];
  const suite = create(
    () => {
      test('a', () => void calls.push('a'));
      test('b', () => void calls.push('b'));
    },
    enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
  );
  const a = suite.changed('a');
  const b = suite.changed('b');
  a.run({ a: 'x', b: 'x' });
  b.run({ a: 'x', b: 'x' });
  expect(calls).toEqual(['a', 'b']);
  suite.run({ a: 'x', b: 1 } as never);
  suite.remove('b');
  expect(a.run({ a: 'x', b: 'x' }).hasErrors('b')).toBe(false);
  suite.reset();
  expect(a.run({ a: 'x', b: 'x' }).hasErrors()).toBe(false);
});

it('does not let a changed run contaminate stateless submission validation', () => {
  const suite = create(
    () => test('a', () => true),
    enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
  );
  suite.changed('a').run({ a: 'x', b: 1 } as never);
  expect(suite['~standard'].validate({ a: 'x', b: 1 })).toMatchObject({
    issues: [{ path: ['b'] }],
  });
  expect(suite.runStatic({ a: 'x', b: 'x' }).value).toEqual({ a: 'x', b: 'x' });
});

it('returns an empty validated output for an empty selection with array or scalar roots', () => {
  const array = create(
    () => test('a', () => true),
    enforce.isArrayOf(enforce.isString()),
  );
  const scalar = create(() => test('a', () => true), enforce.isNumber());
  array.run(['x']);
  scalar.run(1);
  expect(array.changed([]).run(['x']).value).toEqual({});
  expect(scalar.changed([]).run(1).value).toEqual({});
});

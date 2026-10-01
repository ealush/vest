import { describe, expect, it } from 'vitest';

import { SuiteSerializer } from '../../exports/SuiteSerializer';
import { create, enforce, test } from '../../vest';

const schema = enforce.shape({
  a: enforce.isString(),
  b: enforce.isString(),
  box: enforce.shape({ inner: enforce.isString() }),
});

type Data = { a: unknown; b: unknown; box: { inner: unknown } };

const valid: Data = { a: 'a', b: 'b', box: { inner: 'x' } };
const badB: Data = { ...valid, b: 1 };

function createSuite() {
  return create((data: Data) => {
    test('a', () => {
      enforce(data.a).isString();
    });
  }, schema as never);
}

describe('schema failures outside the focused fields', () => {
  it('are retained by only()', () => {
    const suite = createSuite();
    expect(suite.run(badB).hasErrors('b')).toBe(true);

    const result = suite.only('a').run(badB);
    expect(result.hasErrors('b')).toBe(true);
    expect(result.isValid()).toBe(false);
  });

  it('are retained by focus({ skip })', () => {
    const suite = createSuite();
    suite.run(badB);

    const result = suite.focus({ skip: 'b' }).run(badB);
    expect(result.hasErrors('b')).toBe(true);
  });

  it('are retained across several focused runs', () => {
    const suite = createSuite();
    suite.run(badB);
    suite.only('a').run(badB);
    expect(suite.only('a').run(badB).hasErrors('b')).toBe(true);
  });

  it('clear once the field is validated again and passes', () => {
    const suite = createSuite();
    suite.run(badB);
    suite.only('a').run(badB);

    const result = suite.only('b').run(valid);
    expect(result.hasErrors('b')).toBe(false);
    expect(suite.only('a').run(valid).hasErrors('b')).toBe(false);
  });

  it('clear on the next full run', () => {
    const suite = createSuite();
    suite.run(badB);
    suite.only('a').run(badB);
    expect(suite.run(valid).hasErrors('b')).toBe(false);
  });

  it('are not resurrected after resetField', () => {
    const suite = createSuite();
    suite.run(badB);
    suite.resetField('b');
    expect(suite.only('a').run(badB).hasErrors('b')).toBe(false);
  });

  it('are not resurrected after reset', () => {
    const suite = createSuite();
    suite.run(badB);
    suite.reset();
    expect(suite.only('a').run(badB).hasErrors('b')).toBe(false);
  });

  it('follow nested paths by their top-level key', () => {
    const suite = createSuite();
    const badInner: Data = { ...valid, box: { inner: 1 } };
    expect(suite.run(badInner).hasErrors('box.inner')).toBe(true);

    expect(suite.only('a').run(badInner).hasErrors('box.inner')).toBe(true);
    expect(suite.only('box').run(valid).hasErrors('box.inner')).toBe(false);
  });

  it('are never reported twice', () => {
    const suite = createSuite();
    suite.run(badB);
    const result = suite.only('a').run(badB);
    expect(result.tests.b.errorCount).toBe(1);
  });

  it('do not retain root failures once the input is valid', () => {
    const suite = createSuite();
    expect(suite.run(null as never).hasErrors()).toBe(true);
    expect(suite.only('a').run(valid).hasErrors()).toBe(false);
  });

  it('retains literal dotted schema keys independently of their prefix', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.isString(),
        'a.b': enforce.isString(),
      }),
    );
    const data = { a: 'valid', 'a.b': 1 } as never;
    expect(suite.run(data).hasErrors('a.b')).toBe(true);
    expect(suite.only('a').run(data).hasErrors('a.b')).toBe(true);
    expect(suite.only('a').run(data).hasErrors('a.b')).toBe(true);
    expect(
      suite.only('a.b').run({ a: 'valid', 'a.b': 'valid' }).hasErrors('a.b'),
    ).toBe(false);
  });

  it('retains a schema field named like the root failure display name', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.isString(),
        __root__: enforce.isString(),
      }),
    );
    const data = { a: 'valid', __root__: 1 } as never;
    expect(suite.run(data).hasErrors('__root__')).toBe(true);
    expect(suite.only('a').run(data).hasErrors('__root__')).toBe(true);
    expect(
      suite
        .only('__root__')
        .run({ a: 'valid', __root__: 'valid' })
        .hasErrors('__root__'),
    ).toBe(false);
  });

  it.each(['a.b', '__root__'])(
    'keeps the original schema key %s across serialization and resume',
    field => {
      const makeSuite = () =>
        create(
          () => test('a', () => true),
          enforce.shape({ a: enforce.isString(), [field]: enforce.isString() }),
        );
      const source = makeSuite();
      const data = { a: 'valid', [field]: 1 } as never;
      expect(source.run(data).hasErrors(field)).toBe(true);
      const restored = makeSuite();
      SuiteSerializer.resume(restored, SuiteSerializer.serialize(source));
      expect(restored.only('a').run(data).hasErrors(field)).toBe(true);
    },
  );

  it.each([false, true])(
    'retains nested errors across repeated skip runs (resume: %s)',
    resume => {
      const suite = createSuite();
      const data: Data = { ...valid, box: { inner: 1 } };
      expect(suite.run(data).hasErrors('box.inner')).toBe(true);
      expect(
        suite.focus({ skip: 'box' }).run(data).hasErrors('box.inner'),
      ).toBe(true);
      const target = resume ? createSuite() : suite;
      if (resume)
        SuiteSerializer.resume(target, SuiteSerializer.serialize(suite));
      expect(
        target.focus({ skip: 'box' }).run(data).hasErrors('box.inner'),
      ).toBe(true);
      expect(
        target.focus({ skip: 'box' }).run(data).hasErrors('box.inner'),
      ).toBe(true);
    },
  );

  it.each([false, true])(
    'keeps distinct schema paths with the same displayed name (resume: %s)',
    resume => {
      const makeSuite = () =>
        create(
          () => test('other', () => true),
          enforce.shape({
            'a.b': enforce.isString().message('literal error'),
            a: enforce.shape({ b: enforce.isString().message('nested error') }),
            other: enforce.isString(),
          }),
        );
      const suite = makeSuite();
      const data = { 'a.b': 1, a: { b: 1 }, other: 'ok' } as never;
      expect(suite.run(data).getErrors('a.b')).toEqual(['literal error']);
      const target = resume ? makeSuite() : suite;
      if (resume)
        SuiteSerializer.resume(target, SuiteSerializer.serialize(suite));
      const focused = target.focus({ skip: 'a.b' }).run(data);
      const schemaTests = target
        .dump()
        .children?.find(child => child?.data?.schemaValidation)?.children;
      expect(new Set(schemaTests?.map(node => node?.key)).size).toBe(2);
      expect(focused.getErrors('a.b')).toEqual(['literal error']);
      const nestedPasses = {
        'a.b': 1,
        a: { b: 'valid' },
        other: 'ok',
      } as never;
      expect(target.only('a').run(nestedPasses).getErrors('a.b')).toEqual([
        'literal error',
      ]);
      expect(target.only('other').run(nestedPasses).getErrors('a.b')).toEqual([
        'literal error',
      ]);
    },
  );

  it('keeps no-schema serialization free of schema metadata', () => {
    const suite = create(() => test('a', () => true));
    suite.run();
    const restored = SuiteSerializer.deserialize(
      SuiteSerializer.serialize(suite),
    );
    expect(
      restored.children?.some(
        child => child?.data && 'schemaValidation' in child.data,
      ),
    ).toBe(false);
  });

  it('do not change unfocused runs', () => {
    const suite = createSuite();
    suite.run(badB);
    const result = suite.run(valid);
    expect(result.hasErrors()).toBe(false);
    expect(result.isValid()).toBe(true);
  });
});

import { describe, it } from 'vitest';

import { enforce } from 'n4s';
import { create } from 'vest';

type AssertTrue<T extends true> = T;
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() =>
  T extends B ? 1 : 2
)
  ? (<T>() => T extends B ? 1 : 2) extends (<T>() => T extends A ? 1 : 2)
    ? true
    : false
  : false;

describe('schema driven suite types', () => {
  it('infers data type from enforce.shape schema', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });

    const suite = create((data) => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { name: string; age: number }>
      >);
      void (0 as unknown as AssertTrue<
        IsEqual<(typeof data)['name'], string>
      >);
      void (0 as unknown as AssertTrue<
        IsEqual<(typeof data)['age'], number>
      >);
    }, schema);

    void (0 as unknown as AssertTrue<
      IsEqual<Parameters<typeof suite.run>[0], { name: string; age: number }>
    >);

    suite.run({ name: 'john', age: 42 });

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof suite.get>['types'],
        { data: { name: string; age: number }; schema: typeof schema }
      >
    >);

    // @ts-expect-error - requires an argument matching the schema
    suite.run();

    // @ts-expect-error - empty object does not satisfy schema
    suite.run({});

    // @ts-expect-error - missing age should fail type-check
    suite.run({ name: 'jane' });

    // @ts-expect-error - wrong property types should fail
    suite.run({ name: 100, age: true });

    // @ts-expect-error - unexpected keys that don't satisfy schema should fail
    suite.run({ number: 'john' });
  });

  it('disallows invalid runs for custom schema', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      number: enforce.isNumber(),
    });

    const suite = create((data) => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { name: string; number: number }>
      >);
    }, schema);

    suite.run({ name: 'valid', number: 1 });

    // @ts-expect-error - run requires argument
    suite.run();

    // @ts-expect-error - empty object does not match schema
    suite.run({});

    // @ts-expect-error - incorrect property types
    suite.run({ name: 100 });

    // @ts-expect-error - incorrect keys should not be allowed
    suite.run({ number: 'john' });
  });

  it('infers loose and partial schemas', () => {
    const looseSchema = enforce.loose({
      title: enforce.isString(),
    });

    const partialSchema = enforce.partial({
      id: enforce.isNumber(),
      label: enforce.isString(),
    });

    const looseSuite = create((data) => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { title: string } & Record<string, unknown>>
      >);
    }, looseSchema);

    const partialSuite = create((data) => {
      void (0 as unknown as AssertTrue<
        IsEqual<
          typeof data,
          { id?: number | undefined; label?: string | undefined }
        >
      >);
    }, partialSchema);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof looseSuite.get>['types']['data'],
        { title: string } & Record<string, unknown>
      >
    >);

    void (0 as unknown as AssertTrue<
      IsEqual<
        ReturnType<typeof partialSuite.get>['types']['data'],
        { id?: number | undefined; label?: string | undefined }
      >
    >);

    looseSuite.run({ title: 'post', extra: true });
    partialSuite.run({ label: 'hello' });

    // @ts-expect-error - label must be string when present
    partialSuite.run({ label: 10 });
  });

  it('keeps backwards compatibility without schema', () => {
    const suite = create((value: number, flag: boolean) => {
      void (0 as unknown as AssertTrue<IsEqual<typeof value, number>>);
      void (0 as unknown as AssertTrue<IsEqual<typeof flag, boolean>>);
    });

    suite.run(10, true);

    void (0 as unknown as AssertTrue<
      IsEqual<ReturnType<typeof suite.get>['types'], undefined>
    >);
  });
});

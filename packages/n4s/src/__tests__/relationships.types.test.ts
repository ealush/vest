import { it } from 'vitest';

import { compose, enforce } from '../n4s';

it('type-checks local dependency references against the shape', () => {
  enforce.shape({
    password: enforce.isString(),
    confirm: enforce.isString().dependsOn($ => $('password')),
  });
  enforce.shape({
    password: enforce.isString(),
    // @ts-expect-error unknown local reference
    confirm: enforce.isString().dependsOn($ => $('pasword')),
  });
  enforce.loose({
    a: enforce.isString(),
    // @ts-expect-error loose() checks references too
    b: enforce.isString().dependsOn($ => $('missing')),
  });
  enforce.partial({
    a: enforce.isString(),
    // @ts-expect-error partial() checks references too
    b: enforce.isString().dependsOn($ => $('missing')),
  });
});

it('checks every reference of arrays and repeated declarations', () => {
  enforce.shape({
    a: enforce.isString(),
    b: enforce.isString(),
    c: enforce
      .isString()
      .dependsOn($ => [$('a'), $('b')])
      .dependsOn($ => $('a')),
  });
  enforce.shape({
    a: enforce.isString(),
    // @ts-expect-error one unknown reference in an array
    c: enforce.isString().dependsOn($ => [$('a'), $('zzz')]),
  });
  enforce.shape({
    a: enforce.isString(),
    // @ts-expect-error a later declaration is checked as well
    c: enforce
      .isString()
      .dependsOn($ => $('a'))
      .dependsOn($ => $('zzz')),
  });
});

it('checks nested paths against the referenced field data', () => {
  enforce.shape({
    address: enforce.shape({ city: enforce.isString() }),
    zip: enforce.isString().dependsOn($ => $('address', 'city')),
  });
  enforce.shape({
    address: enforce.shape({ city: enforce.isString() }),
    // @ts-expect-error unknown nested key
    zip: enforce.isString().dependsOn($ => $('address', 'citee')),
  });
  enforce.shape({
    contact: enforce.anyOf(
      enforce.shape({ email: enforce.isString() }),
      enforce.shape({ phone: enforce.isString() }),
    ),
    // a key of any union member is accepted
    c: enforce.isString().dependsOn($ => $('contact', 'phone')),
  });
  enforce.shape({
    rows: enforce.isArrayOf(enforce.shape({ a: enforce.isString() })),
    total: enforce.isNumber().dependsOn($ => $('rows', '0', 'a')),
  });
});

it('checks each nested shape against its own fields', () => {
  enforce.shape({
    country: enforce.isString(),
    rows: enforce.isArrayOf(
      enforce.shape({
        state: enforce.isString(),
        // a local reference resolves inside the item shape, not the outer one
        // @ts-expect-error country is a field of the outer shape
        tax: enforce.isString().dependsOn($ => $('country')),
      }),
    ),
  });
});

it('leaves root references and composed rules to runtime checks', () => {
  enforce.shape({
    accountType: enforce.isString(),
    company: enforce.shape({
      taxId: enforce.isString().dependsOn($ => $.root('accountType')),
      other: enforce.isString().dependsOn($ => $.root('anything')),
    }),
  });
  enforce.shape({
    a: enforce.isString(),
    b: compose(enforce.isString()).dependsOn($ => $('a')),
  });
});

it('checks dependsOn() when it is declared last in the chain', () => {
  enforce.shape({
    a: enforce.isString(),
    // @ts-expect-error validators chained first, dependsOn() last
    b: enforce
      .isString()
      .longerThan(1)
      .dependsOn($ => $('zzz')),
  });
  // Rules chained after dependsOn() drop the declared paths from the type,
  // so only the runtime check at create() or describe() reports this one.
  enforce.shape({
    a: enforce.isString(),
    b: enforce
      .isString()
      .dependsOn($ => $('zzz'))
      .longerThan(1),
  });
});

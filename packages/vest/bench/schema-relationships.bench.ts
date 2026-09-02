/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { bench, describe } from 'vitest';
import {
  create,
  test,
  enforce,
  group,
  skipWhen,
  omitWhen,
  optional,
  warn,
  mode,
  Modes,
  each,
} from '../src/vest';
import { SuiteSerializer } from '../src/exports/SuiteSerializer';
import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';

// ──────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────
const travelersData = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    country: 'US',
    passportNumber: `P${i}`,
  }));

// ──────────────────────────────────────────────────────────────
// Group A — Schema creation with relationships (12 benches)
// ──────────────────────────────────────────────────────────────
describe('Schema creation — with vs without relationships', () => {
  bench(
    'A1 create flat (no rel) [2 fields]',
    () => {
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      });
    },
    { time: 250 },
  );

  bench(
    'A2 create flat with dependsOn [2 fields, 1 edge]',
    () => {
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      });
    },
    { time: 250 },
  );

  bench(
    'A3 create flat with revalidates alias [2 fields, 1 edge]',
    () => {
      enforce.shape({
        a: enforce.isString().revalidates($ => $.b),
        b: enforce.isString(),
      });
    },
    { time: 250 },
  );

  bench(
    'A4 create flat multi-source [4 fields, total→3]',
    () => {
      enforce.shape({
        quantity: enforce.isNumber(),
        unitPrice: enforce.isNumber(),
        currency: enforce.isString(),
        total: enforce
          .isNumber()
          .dependsOn($ => [$.quantity, $.unitPrice, $.currency]),
      });
    },
    { time: 250 },
  );

  bench(
    'A5 create nested 3-level with rebase [outer→middle→inner]',
    () => {
      const inner = enforce.shape({
        city: enforce.isString(),
        zip: enforce.isString().dependsOn($ => $.city),
      });
      const middle = enforce.shape({ address: inner });
      enforce.shape({ user: middle });
    },
    { time: 250 },
  );

  bench(
    'A6 create reusable shared address ×2 [2×2 fields]',
    () => {
      const address = enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      });
      enforce.shape({
        billing: address,
        shipping: address,
      });
    },
    { time: 250 },
  );

  bench(
    'A7 create array same-item one traveler [travelers.$item]',
    () => {
      const traveler = enforce.shape({
        country: enforce.isString(),
        passportNumber: enforce.isString().dependsOn($ => $.country),
      });
      enforce.shape({ travelers: enforce.isArrayOf(traveler) });
    },
    { time: 250 },
  );

  bench(
    'A8 create $.root escape [company.taxId→root]',
    () => {
      enforce.shape({
        accountType: enforce.isString(),
        company: enforce.shape({
          country: enforce.isString(),
          taxId: enforce
            .isString()
            .dependsOn($ => [$.country, ($ as any).root.accountType]),
        }),
      });
    },
    { time: 250 },
  );

  bench(
    'A9 create nested arrays orders→items [2× $item bindings]',
    () => {
      const item = enforce.shape({
        name: enforce.isString(),
        discount: enforce.isString().dependsOn($ => $.name),
      });
      const order = enforce.shape({
        items: enforce.isArrayOf(item),
      });
      enforce.shape({ orders: enforce.isArrayOf(order) });
    },
    { time: 250 },
  );

  bench(
    'A10 create cyclic 2-node [start↔end]',
    () => {
      enforce.shape({
        start: enforce.isString().dependsOn($ => $.end),
        end: enforce.isString().dependsOn($ => $.start),
      });
    },
    { time: 250 },
  );

  bench(
    'A11 create fan-out 1→2 [password→2 dependents]',
    () => {
      enforce.shape({
        password: enforce.isString(),
        confirmPassword: enforce.isString().dependsOn($ => $.password),
        hint: enforce.isString().dependsOn($ => $.password),
      });
    },
    { time: 250 },
  );

  bench(
    'A12 create large 100-field chain [100 fields, 10 edges]',
    () => {
      const fields: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        if (i % 10 === 0 && i > 0) {
          const prevKey = `field_${i - 10}`;
          fields[`field_${i}`] = enforce
            .isString()
            .dependsOn(($: any) => $[prevKey]);
        } else {
          fields[`field_${i}`] = enforce.isString();
        }
      }
      enforce.shape(fields);
    },
    { time: 250 },
  );
});

// ──────────────────────────────────────────────────────────────
// Group B — describe() metadata read (6 benches)
// ──────────────────────────────────────────────────────────────
describe('describe() — metadata read', () => {
  const flatWith = enforce.shape({
    password: enforce.isString(),
    confirmPassword: enforce.isString().dependsOn(($: any) => $.password),
  });
  const flatNoRel = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString(),
  });

  const addressReuse = enforce.shape({
    country: enforce.isString(),
    state: enforce.isString().dependsOn($ => $.country),
  });
  const checkoutReuse = enforce.shape({
    billing: addressReuse,
    shipping: addressReuse,
  });

  const travelerForB = enforce.shape({
    country: enforce.isString(),
    passportNumber: enforce.isString().dependsOn($ => $.country),
  });
  const bookingForB = enforce.shape({
    travelers: enforce.isArrayOf(travelerForB),
  });

  bench(
    'B1 describe flat no rel',
    () => {
      (flatNoRel as any).describe();
    },
    { time: 150 },
  );

  bench(
    'B2 describe flat with one edge',
    () => {
      (flatWith as any).describe();
    },
    { time: 150 },
  );

  bench(
    'B3 describe nested reusable 2× [checkout billing+shipping]',
    () => {
      (checkoutReuse as any).describe();
    },
    { time: 150 },
  );

  bench(
    'B4 describe array same-item [booking travelers]',
    () => {
      (bookingForB as any).describe();
    },
    { time: 150 },
  );

  bench(
    'B5 describe JSON round-trip [flat with edge]',
    () => {
      JSON.parse(JSON.stringify((flatWith as any).describe()));
    },
    { time: 150 },
  );

  bench(
    'B6 describe repeated ×3 [idempotency / cache]',
    () => {
      (flatWith as any).describe();
      (flatWith as any).describe();
      (flatWith as any).describe();
    },
    { time: 150 },
  );
});

// ──────────────────────────────────────────────────────────────
// Group D — Integration matrix + realistic flows (13 benches)
// ──────────────────────────────────────────────────────────────

// Shared fixtures for D
const dAddressSchema = enforce.shape({
  country: enforce.isString(),
  state: enforce.isString().dependsOn($ => $.country),
});

const dTravelerSchema = enforce.shape({
  country: enforce.isString(),
  passportNumber: enforce.isString().dependsOn($ => $.country),
});

const dSkipWhenSchema = enforce.shape({
  country: enforce.isString(),
  state: enforce.isString().dependsOn($ => $.country),
});

const dOmitWhenSchema = enforce.shape({
  country: enforce.isString(),
  nickname: enforce.isString().dependsOn($ => $.country),
});

const dOptionalSchema = enforce.shape({
  password: enforce.isString(),
  confirmPassword: enforce.isString().dependsOn($ => $.password),
});

const dChainSchema = enforce.shape({
  a: enforce.isString(),
  b: enforce.isString().dependsOn($ => $.a),
  c: enforce.isString().dependsOn($ => $.b),
});

const dFanoutSchema = enforce.shape({
  password: enforce.isString(),
  confirmPassword: enforce.isString().dependsOn($ => $.password),
  hint: enforce.isString().dependsOn($ => $.password),
  email: enforce.isString(),
});

describe('Integration matrix — changed() meets Vest features', () => {
  // D1 skipWhen
  {
    const d1Suite = create((data: any) => {
      test('country', () => {
        enforce(data.country).isString();
      });
      skipWhen(data.country !== 'US', () => {
        test('state', () => {
          enforce(data.state).isString();
        });
      });
    }, dSkipWhenSchema);
    d1Suite.run({ country: 'CA', state: '' });
    bench(
      'D1 skipWhen changed(country) CA→US [candidate but Vest skips]',
      () => {
        d1Suite.changed('country').run({ country: 'US', state: '' });
      },
      { time: 250 },
    );
  }

  // D2 omitWhen
  {
    const d2Suite = create((data: any) => {
      test('country', () => {
        enforce(data.country).isString();
      });
      omitWhen(data.omitNickname, () => {
        test('nickname', () => {
          enforce(data.nickname).isString();
        });
      });
    }, dOmitWhenSchema);
    d2Suite.run({ country: 'US', nickname: 'x', omitNickname: false });
    bench(
      'D2 omitWhen changed(country) with omit guard [omitted branch]',
      () => {
        d2Suite
          .changed('country')
          .run({ country: 'CA', nickname: 'x', omitNickname: true });
      },
      { time: 250 },
    );
  }

  // D3 optional (suite-level)
  {
    const d3Schema = enforce.shape({
      email: enforce.isString(),
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });
    const d3Suite = create((data: any) => {
      optional('password');
      optional('confirmPassword');
      test('password', () => {
        enforce(data.password).isString();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
      test('email', () => {
        enforce(data.email).isString();
      });
    }, d3Schema);
    d3Suite.run({ email: 'a@b.com', password: '', confirmPassword: '' });
    bench(
      'D3 optional suite changed(password) [optional field + dependent]',
      () => {
        d3Suite.changed('password').run({
          email: 'a@b.com',
          password: 'secret123',
          confirmPassword: '',
        });
      },
      { time: 250 },
    );
  }

  // D4 optional (n4s-level via enforce.isString() — suite just validates)
  {
    // Use a shape where n4s optional field has dependsOn; suite passes through
    const d4Suite = create(
      (data: any) => {
        test('a', () => {
          enforce(data.a).isString();
        });
        test('b', () => {
          enforce(data.b).isString();
        });
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.optional(enforce.isString().dependsOn($ => $.a)),
      }),
    );
    d4Suite.run({ a: 'x', b: 'y' });
    bench(
      'D4 n4s optional shape changed(a) [b dependsOn a, optional at n4s]',
      () => {
        d4Suite.changed('a').run({ a: 'new', b: 'y' });
      },
      { time: 250 },
    );
  }

  // D5 warn + optional intersection
  {
    const d5Suite = create((data: any) => {
      optional('confirmPassword');
      test('password', () => {
        enforce(data.password).isString();
      });
      test('confirmPassword', () => {
        warn();
        enforce(data.confirmPassword).equals(data.password);
      });
    }, dOptionalSchema);
    d5Suite.run({ password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    bench(
      'D5 warn intersection changed(password) [warn field rerun]',
      () => {
        d5Suite
          .changed('password')
          .run({ password: 'xyz', confirmPassword: 'abcdefgh' });
      },
      { time: 250 },
    );
  }

  // D6 group + each combination
  {
    const d6Traveler = enforce.shape({
      country: enforce.isString(),
      passport: enforce.isString().dependsOn($ => $.country),
    });
    const d6Schema = enforce.shape({
      travelers: enforce.isArrayOf(d6Traveler),
    });
    const d6Suite = create((data: any) => {
      group('travelers' as TGroupName, () => {
        each(data.travelers, (t: any, i: number) => {
          test(`travelers.${i}.country` as TFieldName, () => {
            enforce(t.country).isString();
          });
          test(`travelers.${i}.passport` as TFieldName, () => {
            enforce(t.passport).isString();
          });
        });
      });
    }, d6Schema);
    const d6Data = { travelers: travelersData(5) };
    d6Suite.run(d6Data);
    bench(
      'D6 group+each changed(travelers.1.country) [5 travelers, 10 tests]',
      () => {
        d6Suite.changed('travelers.1.country').run(d6Data);
      },
      { time: 250 },
    );
  }

  // D7 each + group ×10
  {
    const d7Schema = enforce.shape({
      items: enforce.isArrayOf(
        enforce.shape({
          label: enforce.isString(),
          value: enforce.isString().dependsOn($ => $.label),
        }),
      ),
    });
    const d7Suite = create((data: any) => {
      each(data.items, (item: any, index: number) => {
        group(`item_${index}` as TGroupName, () => {
          test(`items.${index}.label` as TFieldName, () => {
            enforce(item.label).isString();
          });
          test(`items.${index}.value` as TFieldName, () => {
            enforce(item.value).isString();
          });
        });
      });
    }, d7Schema);
    const d7Data = {
      items: Array.from({ length: 10 }, (_, i) => ({
        label: `l${i}`,
        value: `v${i}`,
      })),
    };
    d7Suite.run(d7Data);
    bench(
      'D7 each×group(10) changed(items.3.label) [20 tests, 10 groups]',
      () => {
        d7Suite.changed('items.3.label').run(d7Data);
      },
      { time: 250 },
    );
  }

  // D8 mode ALL vs ONE under changed
  {
    const d8SuiteAll = create(
      (data: any) => {
        mode(Modes.ALL);
        test('a', () => {
          enforce(data.a).isString();
        });
        test('b', () => {
          enforce(data.b).isString();
        });
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      }),
    );
    d8SuiteAll.run({ a: 'x', b: 'y' });
    const d8SuiteOne = create(
      (data: any) => {
        mode(Modes.ONE);
        test('a', () => {
          enforce(data.a).isString();
        });
        test('b', () => {
          enforce(data.b).isString();
        });
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      }),
    );
    d8SuiteOne.run({ a: 'x', b: 'y' });
    bench(
      'D8 mode ALL changed(a) [a→b, EAGER-like]',
      () => {
        d8SuiteAll.changed('a').run({ a: 'new', b: 'y' });
      },
      { time: 250 },
    );
    bench(
      'D8 mode ONE changed(a) [single-error mode]',
      () => {
        d8SuiteOne.changed('a').run({ a: 'new', b: 'y' });
      },
      { time: 250 },
    );
  }

  // D9 async waterfall
  {
    const d9Schema = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
      email: enforce.isString(),
    });
    const d9Suite = create((data: any) => {
      test('organizationId', () => {
        enforce(data.organizationId).isString();
      });
      test('username', async () => {
        const available = await Promise.resolve(data.username !== 'taken');
        enforce(available).isTruthy();
      });
      test('email', async () => {
        await Promise.resolve();
        enforce(data.email).isString();
      });
    }, d9Schema);
    d9Suite.run({ organizationId: 'A', username: 'free', email: 'a@b.com' });
    bench(
      'D9 async waterfall changed(organizationId) [2 async dependents]',
      () => {
        d9Suite
          .changed('organizationId')
          .run({ organizationId: 'B', username: 'free', email: 'a@b.com' });
      },
      { time: 250 },
    );
  }

  // D10 serialize large after changed — retain + serialize cost
  {
    const d10Count = 100;
    const d10Fields: Record<string, any> = {};
    for (let i = 0; i < d10Count; i++)
      d10Fields[`field_${i}`] = enforce.isString();
    // one dependency to give changed() something to do
    d10Fields['dependent'] = enforce.isString().dependsOn($ => $.field_0);
    const d10Schema = enforce.shape(d10Fields);
    const d10Data: Record<string, string> = {};
    for (let i = 0; i < d10Count; i++) d10Data[`field_${i}`] = `v${i}`;
    d10Data['dependent'] = 'x';

    const d10Suite = create((data: any) => {
      for (let i = 0; i < d10Count; i++) {
        test(`field_${i}` as TFieldName, () => {
          enforce(data[`field_${i}`]).isString();
        });
      }
      test('dependent' as TFieldName, () => {
        enforce(data.dependent).isString();
      });
    }, d10Schema);
    d10Suite.run(d10Data);
    bench(
      'D10 serialize large(100) after changed(field_0) [retain+serialize]',
      () => {
        const res = d10Suite
          .changed('field_0')
          .run({ ...d10Data, field_0: 'new' });
        SuiteSerializer.serialize(res);
      },
      { time: 250 },
    );
  }

  // D11 realistic registration flow — sequential changed steps in one iteration
  {
    const regSchema = enforce.shape({
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
    const regSuite = create((data: any) => {
      test('email', () => {
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
    }, regSchema);
    // initial warm run
    regSuite.run({
      email: '',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
      organizationId: 'A',
      username: 'free',
      profile: { country: 'CA', state: '' },
    });

    bench(
      'D11 realistic registration flow — 6-step sequence [email→password→org→country]',
      () => {
        // Single iteration does the whole realistic sequence (steady-state)
        regSuite.changed('email').run({
          email: 'a@b.com',
          password: 'abcdefgh',
          confirmPassword: 'abcdefgh',
          organizationId: 'A',
          username: 'free',
          profile: { country: 'CA', state: '' },
        });
        regSuite.changed('password').run({
          email: 'a@b.com',
          password: 'abcdefgh2',
          confirmPassword: 'abcdefgh',
          organizationId: 'A',
          username: 'free',
          profile: { country: 'CA', state: '' },
        });
        regSuite.changed('confirmPassword').run({
          email: 'a@b.com',
          password: 'abcdefgh2',
          confirmPassword: 'abcdefgh2',
          organizationId: 'A',
          username: 'free',
          profile: { country: 'CA', state: '' },
        });
        regSuite.changed('organizationId').run({
          email: 'a@b.com',
          password: 'abcdefgh2',
          confirmPassword: 'abcdefgh2',
          organizationId: 'B',
          username: 'free',
          profile: { country: 'CA', state: '' },
        });
        regSuite.changed('profile.country').run({
          email: 'a@b.com',
          password: 'abcdefgh2',
          confirmPassword: 'abcdefgh2',
          organizationId: 'B',
          username: 'free',
          profile: { country: 'US', state: '' },
        });
      },
      { time: 250 },
    );
  }

  // D12 realistic checkout flow — billing+shipping+travelers interleaved
  {
    const checkoutAddress = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });
    const checkoutTraveler = enforce.shape({
      country: enforce.isString(),
      passportNumber: enforce.isString().dependsOn($ => $.country),
    });
    const checkoutSchema = enforce.shape({
      billing: checkoutAddress,
      shipping: checkoutAddress,
      travelers: enforce.isArrayOf(checkoutTraveler),
    });
    const checkoutSuite = create((data: any) => {
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
      each(data.travelers, (t: any, i: number) => {
        test(`travelers.${i}.country` as TFieldName, () => {
          enforce(t.country).isString();
        });
        test(`travelers.${i}.passportNumber` as TFieldName, () => {
          enforce(t.passportNumber).isString();
        });
      });
    }, checkoutSchema);
    const checkoutData = {
      billing: { country: 'US', state: 'CA' },
      shipping: { country: 'US', state: 'NY' },
      travelers: travelersData(5),
    };
    checkoutSuite.run(checkoutData);
    bench(
      'D12 realistic checkout flow — billing+shipping+travelers [9 travelers total]',
      () => {
        checkoutSuite
          .changed('billing.country')
          .run({ ...checkoutData, billing: { country: 'CA', state: 'CA' } });
        checkoutSuite.changed('travelers.2.country').run(checkoutData);
        checkoutSuite
          .changed('shipping.country')
          .run({ ...checkoutData, shipping: { country: 'CA', state: '' } });
      },
      { time: 250 },
    );
  }

  // D13 volatility stress: 100 fields only 1 changed
  {
    const volFields: Record<string, any> = {};
    for (let i = 0; i < 100; i++) volFields[`field_${i}`] = enforce.isString();
    volFields['consumer'] = enforce.isString().dependsOn($ => $.field_0);
    const volSchema = enforce.shape(volFields);
    const volData: Record<string, string> = {};
    for (let i = 0; i < 100; i++) volData[`field_${i}`] = `v${i}`;
    volData['consumer'] = 'x';

    const volSuiteRun = create((data: any) => {
      for (let i = 0; i < 100; i++) {
        test(`field_${i}` as TFieldName, () => {
          enforce(data[`field_${i}`]).isString();
        });
      }
      test('consumer' as TFieldName, () => {
        enforce(data.consumer).isString();
      });
    }, volSchema);

    const volSuiteChanged = create((data: any) => {
      for (let i = 0; i < 100; i++) {
        test(`field_${i}` as TFieldName, () => {
          enforce(data[`field_${i}`]).isString();
        });
      }
      test('consumer' as TFieldName, () => {
        enforce(data.consumer).isString();
      });
    }, volSchema);

    volSuiteRun.run(volData);
    volSuiteChanged.run(volData);
    const volChangedData = { ...volData, field_0: 'changed' } as typeof volData;

    bench(
      'D13 volatility run() full 101 fields [baseline]',
      () => {
        volSuiteRun.run(volData);
      },
      { time: 250 },
    );
    bench(
      'D13 volatility changed(field_0) [2/101 fields] — ratio gate',
      () => {
        volSuiteChanged.changed('field_0').run(volChangedData);
      },
      { time: 250 },
    );
  }
});

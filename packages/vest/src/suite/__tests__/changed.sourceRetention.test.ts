import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create, test } from '../../vest';

describe('changed() dependency source retention', () => {
  it('does not execute an unaffected source schema validator when only the target changed', async () => {
    const schemaCalls: string[] = [];
    const suiteCalls: string[] = [];

    const schema = enforce.shape({
      country: enforce.condition((value: unknown) => {
        schemaCalls.push(String(value));
        return typeof value === 'string';
      }),
      state: enforce.isString().dependsOn($ => $.country),
    });

    const suite = create(data => {
      test('country', () => {
        suiteCalls.push('country');
        enforce(data.country).isString();
      });
      test('state', () => {
        suiteCalls.push('state');
        enforce(data.state).isString();
      });
    }, schema);

    await suite.run({ country: 'US', state: 'CA' });
    schemaCalls.length = 0;
    suiteCalls.length = 0;

    await suite.changed('state').run({ country: 'US', state: 'NY' });

    expect(suiteCalls).toEqual(['state']);
    expect(schemaCalls).toEqual([]);
  });
});

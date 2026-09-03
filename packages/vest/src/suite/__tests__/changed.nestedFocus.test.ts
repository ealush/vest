import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from '../../vest';
import { getAffectedFields } from '../changed';

describe('changed() nested schema focus and empty changed', () => {
  it('P1: changed(profile.country) reports nested profile.state schema failure', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(() => {}, schema);
    const data: any = { profile: { country: 'US', state: 42 } };
    const result = await suite.changed('profile.country').run(data);
    expect(result.hasErrors('profile.state')).toBe(true);
  });

  it('P1 control: full run() reports nested profile.state schema failure', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(() => {}, schema);
    const data: any = { profile: { country: 'US', state: 42 } };
    const result = await suite.run(data);
    expect(result.hasErrors('profile.state')).toBe(true);
  });

  it('P1: changed(profile.country) with valid nested data reports no errors', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(() => {}, schema);
    const result = await suite
      .changed('profile.country')
      .run({ profile: { country: 'US', state: 'CA' } });
    expect(result.hasErrors('profile.state')).toBe(false);
    expect(result.hasErrors('profile.country')).toBe(false);
  });

  it('P1: changed(profile.country) excludes failures outside affected paths', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
      nickname: enforce.isString(),
    });
    const suite = create(() => {}, schema);
    const data: any = {
      profile: { country: 'US', state: 42 },
      nickname: 7,
    };
    const result = await suite.changed('profile.country').run(data);
    expect(result.hasErrors('profile.state')).toBe(true);
    expect(result.hasErrors('nickname')).toBe(false);
  });

  it('P2: changed([]) runs no tests and reports no schema errors', async () => {
    const schema = enforce.shape({
      username: enforce.isString(),
    });
    const executed: string[] = [];
    const suite = create((data: any) => {
      test('username', () => {
        executed.push('username');
        enforce(data.username).isNotBlank();
      });
      test('other', () => {
        executed.push('other');
      });
    }, schema);
    const data: any = { username: 42 };
    const result = await suite.changed([]).run(data);
    expect(executed).toEqual([]);
    expect(result.hasErrors('username')).toBe(false);
    expect(result.hasErrors()).toBe(false);
  });

  it('P0: changed(profile) reports the nested failure on a FRESH suite (no prior full run)', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(() => {}, schema);
    const data: any = { profile: { country: 'US', state: 42 } };
    const result = await suite.changed('profile').run(data);
    expect(result.hasErrors('profile.state')).toBe(true);
    expect(result.getErrors()).not.toEqual({});
  });

  it('P0: changed(travelers) array-parent expands item dependents with data', async () => {
    const travelerSchema = enforce.shape({
      country: enforce.isString(),
      passportNumber: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      travelers: enforce.isArrayOf(travelerSchema),
    });
    const suite = create(() => {}, schema);
    const data: any = {
      travelers: [
        { country: 'US', passportNumber: 'A' },
        { country: 'IL', passportNumber: 42 },
      ],
    };
    const result = await suite.changed('travelers').run(data);
    expect(result.hasErrors('travelers.1.passportNumber')).toBe(true);
  });

  it('P0 order-sensitivity: unrelated earlier field must not hide the affected nested failure', async () => {
    const schema = enforce.shape({
      unrelated: enforce.isString(),
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(() => {}, schema);
    const data: any = {
      unrelated: 42,
      profile: { country: 'US', state: 42 },
    };
    const result = await suite.changed('profile.country').run(data);
    expect(result.hasErrors('profile.state')).toBe(true);
    expect(result.hasErrors('unrelated')).toBe(false);
  });

  it('P1: changed(undefined) is a legal no-op like only(undefined)', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
      }),
    });
    const suite = create(() => {}, schema);
    const data: any = { profile: { country: 'US', state: 42 } };
    const result = await suite.changed(undefined).run(data);
    expect(result.hasErrors('profile.state')).toBe(true);
  });

  it('P2: root→array affected set without data falls back to the top-level key', () => {
    const schema: any = enforce.shape({
      region: enforce.isString(),
      travelers: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          tax: enforce.isString().dependsOn($ => $.root.region),
        }),
      ),
    });
    const affected = getAffectedFields('region', schema, undefined);
    expect(affected).toContain('region');
    expect(affected).toContain('travelers');
    expect(affected.some(field => field.includes('$'))).toBe(false);
  });

  it('P2 control: full run() with the same data runs tests and reports errors', async () => {
    const schema = enforce.shape({
      username: enforce.isString(),
    });
    const executed: string[] = [];
    const suite = create((data: any) => {
      test('username', () => {
        executed.push('username');
        enforce(data.username).isNotBlank();
      });
    }, schema);
    const data: any = { username: 42 };
    const result = await suite.run(data);
    expect(executed).toEqual(['username']);
    expect(result.hasErrors('username')).toBe(true);
  });
});

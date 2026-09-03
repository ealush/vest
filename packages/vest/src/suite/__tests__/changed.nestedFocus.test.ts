import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from '../../vest';

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

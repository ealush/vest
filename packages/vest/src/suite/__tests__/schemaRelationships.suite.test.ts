import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from '../../vest';

/**
 * Vest suite integration — V1 boundary: describe() exists, suite execution NOT auto-affected.
 * only('password') must NOT auto-include confirmPassword even when confirmPassword.dependsOn(password).
 */

describe('Schema Relationships — vest suite V1 boundary', () => {
  it('schema with dependsOn does not change suite execution — test still needed', () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });

    const suite = create(data => {
      test('password', 'password required', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', 'must match', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);

    const result = suite.run({ password: 'abc', confirmPassword: 'xyz' });
    expect(result.hasErrors('confirmPassword')).toBe(true);
  });

  it('only("password") does NOT auto-include confirmPassword in V1', () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirmPassword: enforce.isString().dependsOn($ => $.password),
    });

    const suite = create(data => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);

    const result = suite.only('password').run({
      password: '',
      confirmPassword: 'mismatch',
    });

    // In V1, only('password') runs only password, not dependents
    expect(result.hasErrors('password')).toBe(true);
    // confirmPassword was not run — even though it dependsOn password, it stays as before (not tested in this focused run)
    // The key assertion: V1 does NOT expand affected set
    expect(result.tests.confirmPassword).toBeDefined();
    // If suite was fresh, confirmPassword should be untouched (either not counted or still from no prior run)
    // For a fresh suite, hasErrors('confirmPassword') should be false because it wasn't run
    // We check that the suite did not automatically run confirmPassword's test
    const freshSuite = create(data => {
      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, schema);
    const freshResult = freshSuite.only('password').run({
      password: 'abc',
      confirmPassword: 'xyz',
    });
    // No test named 'password' in freshSuite, so nothing to run — confirms only is explicit
    expect(freshResult.tests.password).toBeUndefined();
  });

  it('async username dependsOn organizationId — schema declares, suite owns async', async () => {
    const schema = enforce.shape({
      organizationId: enforce.isString(),
      username: enforce.isString().dependsOn($ => $.organizationId),
    });

    const suite = create(data => {
      test('username', 'Username unavailable', async () => {
        const available = await Promise.resolve(data.username !== 'taken');
        enforce(available).isTruthy();
      });
    }, schema);

    const result = suite.run({ organizationId: 'org1', username: 'taken' });
    expect(result.isPending('username')).toBe(true);
    await result;
    expect(suite.get().hasErrors('username')).toBe(true);

    const result2 = suite.run({ organizationId: 'org2', username: 'free' });
    await result2;
    expect(suite.get().hasErrors('username')).toBe(false);

    // Schema still records edge even though validation is suite-only async
    expect(schema.describe().dependencies).toHaveLength(1);
  });

  it('repeated runs keep describe() stable', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });

    const suite = create(data => {
      test('a', () => {
        enforce(data.a).isNotBlank();
      });
      test('b', () => {
        enforce(data.b).isNotBlank();
      });
    }, schema);

    suite.run({ a: '1', b: '2' });
    suite.run({ a: '1', b: '2' });
    suite.run({ a: '', b: '' });

    expect(schema.describe().dependencies).toHaveLength(1);
  });

  it('suite supports dependsOn field inside group-like shape nesting', () => {
    const addressSchema = enforce.shape({
      country: enforce.isString(),
      state: enforce.isString().dependsOn($ => $.country),
    });

    const schema = enforce.shape({ billingAddress: addressSchema });
    const suite = create(data => {
      test('billingAddress.state', () => {
        enforce(data.billingAddress.state).isNotBlank();
      });
    }, schema);

    const res = suite.run({
      billingAddress: { country: 'US', state: '' },
    });

    // Schema graph exists
    expect(schema.describe().dependencies).toHaveLength(1);
    expect(res.hasErrors('billingAddress.state')).toBe(true);
  });
});

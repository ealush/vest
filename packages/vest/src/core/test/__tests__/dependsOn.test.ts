import { describe, it, expect } from 'vitest';
import { create, test, enforce, group } from 'vest';

describe('test().dependsOn() -- type and shape', () => {
  it('test() returns an object with a dependsOn method', () => {
    const suite = create((data: { a: string }) => {
      const result = test('a', () => {
        enforce(data.a).isNotEmpty();
      });
      // The return value must have dependsOn as a function
      expect(result).toBeDefined();
      expect(typeof result.dependsOn).toBe('function');
    });
    suite.run({ a: 'hello' });
  });

  it('dependsOn returns the same chainable object (for future chaining)', () => {
    const suite = create((data: { a: string; b: string }) => {
      const result = test('a', () => {
        enforce(data.a).isNotEmpty();
      });
      const chained = result.dependsOn('b');
      expect(chained).toBe(result);
    });
    suite.run({ a: '', b: '' });
  });
});

describe('test().dependsOn() -- Pillar 1: Focus Sync', () => {
  it('auto-includes dependent field during focused run (Pillar 1)', () => {
    const suite = create((data: { password: string; confirmPassword: string }) => {
      test('password', 'Required', () => {
        enforce(data.password).isNotEmpty();
      });
      test('confirmPassword', 'Must match', () => {
        enforce(data.confirmPassword).equals(data.password);
      }).dependsOn('password');
    });

    // Make it dirty first
    suite.run({ password: '', confirmPassword: '' });

    // Focus on password -- confirmPassword should be auto-included since it's dirty
    const result = suite
      .only('password')
      .run({
        password: 'abc123',
        confirmPassword: 'different',
      });

    expect(result.hasErrors('confirmPassword')).toBe(true);
    expect(result.getErrors('confirmPassword')).toContain('Must match');
  });

  it('works with multiple dependencies (Pillar 1)', () => {
    const suite = create((data: { a: string; b: string; total: string }) => {
      test('a', () => enforce(data.a).isNotEmpty());
      test('b', () => enforce(data.b).isNotEmpty());
      test('total', 'Sum must equal 100', () => {
        enforce(Number(data.a) + Number(data.b)).equals(100);
      }).dependsOn('a', 'b');
    });

    // Make it dirty first
    suite.run({ a: '', b: '', total: '' });

    // Focus on 'a' -- 'total' should be included
    const resultA = suite.only('a').run({ a: '30', b: '70', total: '' });
    expect(resultA.isTested('total')).toBe(true);

    // Focus on 'b' -- 'total' should also be included
    const resultB = suite.only('b').run({ a: '30', b: '70', total: '' });
    expect(resultB.isTested('total')).toBe(true);
  });
});

describe('test().dependsOn() -- Pillar 2: Dirty-Field Guard', () => {
  it('does NOT include dependent field if it has never been tested before (Pillar 2)', () => {
    const suite = create((data: { password: string; confirmPassword: string }) => {
      test('password', 'Required', () => {
        enforce(data.password).isNotEmpty();
      });
      test('confirmPassword', 'Must match', () => {
        enforce(data.confirmPassword).equals(data.password);
      }).dependsOn('password');
    });

    // 1st run: focus on password. confirmPassword has NEVER been tested.
    // It should NOT run even though it depends on password.
    const result1 = suite
      .only('password')
      .run({ password: 'abc', confirmPassword: 'def' });

    expect(result1.isTested('confirmPassword')).toBe(false);

    // 2nd run: test confirmPassword once to make it "dirty"
    suite.only('confirmPassword').run({ password: 'abc', confirmPassword: 'abc' });

    // 3rd run: focus on password again. Now confirmPassword IS dirty.
    // It SHOULD run.
    const result3 = suite
      .only('password')
      .run({ password: 'abc', confirmPassword: 'def' });

    expect(result3.isTested('confirmPassword')).toBe(true);
    expect(result3.hasErrors('confirmPassword')).toBe(true);
  });
});

describe('test().dependsOn() -- Pillar 3: Validity Link', () => {
  it('dependent field is INVALID if its dependency is invalid (Pillar 3)', () => {
    const suite = create((data: { password: string; confirmPassword: string }) => {
      const t = test('password', 'Required', () => {
        enforce(data.password).isNotEmpty();
      });
      console.log("TEST RETURN:", Object.keys(t), t.dependsOn);
      test('confirmPassword', 'Must match', () => {
        enforce(data.confirmPassword).equals(data.password);
      }).dependsOn('password');
    });

    // 1st run: password invalid, confirmPassword valid.
    const result1 = suite.run({ password: '', confirmPassword: '' });

    expect(result1.hasErrors('password')).toBe(true);
    expect(result1.hasErrors('confirmPassword')).toBe(false);

    // confirmPassword depends on password, so it should be INVALID because password is invalid.
    expect(result1.isValid('confirmPassword')).toBe(false);
  });

  it('dependent field is INVALID if its dependency is VALID but has own errors', () => {
    const suite = create((data: { password: string; confirmPassword: string }) => {
      test('password', 'Required', () => {
        enforce(data.password).isNotEmpty();
      });
      test('confirmPassword', 'Must match', () => {
        enforce(data.confirmPassword).equals(data.password);
      }).dependsOn('password');
    });

    const result = suite.run({ password: 'abc', confirmPassword: 'def' });

    expect(result.isValid('password')).toBe(true);
    expect(result.hasErrors('confirmPassword')).toBe(true);
    expect(result.isValid('confirmPassword')).toBe(false);
  });

  it('works with recursive invalidation', () => {
    const suite = create((data: { a: string; b: string; c: string }) => {
      test('a', () => enforce(data.a).isNotEmpty());
      test('b', () => enforce(data.b).equals(data.a)).dependsOn('a');
      test('c', () => enforce(data.c).equals(data.b)).dependsOn('b');
    });

    // a -> b -> c
    // if a is invalid, b is invalid, c is invalid.
    const result = suite.run({ a: '', b: '', c: '' });

    expect(result.isValid('a')).toBe(false);
    expect(result.isValid('b')).toBe(false);
    expect(result.isValid('c')).toBe(false);
  });
});

describe('test().dependsOn() -- Integration Patterns', () => {
  it('works with groups', () => {
    const suite = create((data: { password: string; confirmPassword: string }) => {
      group('auth', () => {
        test('password', 'Required', () => {
          enforce(data.password).isNotEmpty();
        });
        test('confirmPassword', 'Must match', () => {
          enforce(data.confirmPassword).equals(data.password);
        }).dependsOn('password');
      });
    });

    const result = suite.only('password').run({
      password: 'abc',
      confirmPassword: 'different',
    });

    // confirmPassword should be auto-included even inside group
    // But wait, it needs to be "dirty" for Pillar 2.
    
    // Let's make it dirty first
    suite.run({ password: 'abc', confirmPassword: 'abc' });
    
    const result2 = suite.only('password').run({
      password: 'abc',
      confirmPassword: 'different'
    });

    expect(result2.hasErrors('confirmPassword')).toBe(true);
  });

  it('works with async tests', async () => {
    const suite = create((data: { username: string; profile: string }) => {
      test('username', 'Required', () => {
        enforce(data.username).isNotEmpty();
      });
      test('profile', 'Username must exist first', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        enforce(data.profile).isNotEmpty();
      }).dependsOn('username');
    });

    // Make dirty
    const firstRun = suite.run({ username: 'alice', profile: 'something' });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const result = suite.only('username').run({
      username: 'alice',
      profile: '',
    });

    // Wait for async tests to finish
    await new Promise((resolve) => setTimeout(resolve, 20)); // Just wait so setTimeout triggers
    expect(result.isValid('profile')).toBe(false);
  });
});

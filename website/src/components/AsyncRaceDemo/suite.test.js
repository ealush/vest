import { describe, expect, it, vi } from 'vitest';

import { createSignupSuite } from './suite';

describe('async race demo suite', () => {
  it('keeps the latest username result when older requests finish later', async () => {
    const resolvers = new Map();
    const completions = [];
    const suite = createSignupSuite({
      onRequestComplete: request => completions.push(request),
      wait: delayMs =>
        new Promise(resolve => {
          resolvers.set(delayMs, resolve);
        }),
    });

    suite.only('email').run({ email: 'dev@vest.dev' });

    suite
      .only('username')
      .run({ username: 'evy', requestId: 1, delayMs: 1400 });
    suite
      .only('username')
      .run({ username: 'evyat', requestId: 2, delayMs: 850 });
    const latestRun = suite
      .only('username')
      .run({ username: 'evyatar', requestId: 3, delayMs: 300 });

    resolvers.get(300)();
    await latestRun;

    expect(suite.isValid('username')).toBe(true);
    expect(suite.isValid('email')).toBe(true);

    resolvers.get(1400)();
    resolvers.get(850)();
    await vi.waitFor(() => expect(completions).toHaveLength(3));

    expect(completions.map(request => request.id)).toEqual([3, 1, 2]);
    expect(completions.find(request => request.id === 1)).toMatchObject({
      available: false,
      stale: true,
    });
    expect(completions.find(request => request.id === 2)).toMatchObject({
      stale: true,
    });
    expect(completions.find(request => request.id === 3)).toMatchObject({
      stale: false,
    });
    expect(suite.isValid('username')).toBe(true);
    expect(suite.isValid('email')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { createAsyncApp, requestAccount } from './app';

describe('Vest with Hono', () => {
  it('accepts valid input and passes transformed output to the handler', async () => {
    await expect(
      requestAccount({
        email: '  DEV@EXAMPLE.COM  ',
        profile: { age: '42' },
      }),
    ).resolves.toEqual({
      body: {
        account: { email: 'dev@example.com', profile: { age: 42 } },
      },
      status: 201,
    });
  });

  it('rejects invalid input with nested Standard Schema issues', async () => {
    const response = await requestAccount({
      email: 'invalid',
      profile: { age: '16' },
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: expect.arrayContaining([
        expect.objectContaining({ path: ['profile', 'age'] }),
      ]),
    });
  });

  it('awaits asynchronous Vest validation before the handler', async () => {
    const app = createAsyncApp(async username => username !== 'taken');

    const response = await app.request('/usernames', {
      body: JSON.stringify({ username: 'taken' }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false });
  });
});

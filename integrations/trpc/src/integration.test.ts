import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';

import { createAccount, createAsyncRouter } from './router';

describe('Vest with tRPC', () => {
  it('passes transformed Vest output to the procedure', async () => {
    await expect(
      createAccount({
        email: '  DEV@EXAMPLE.COM  ',
        profile: { age: '42' },
      }),
    ).resolves.toEqual({
      accepted: true,
      account: { email: 'dev@example.com', profile: { age: 42 } },
    });
  });

  it('rejects invalid input before the procedure runs', async () => {
    const error = await createAccount({
      email: 'invalid',
      profile: { age: '16' },
    }).catch(reason => reason);

    expect(error).toBeInstanceOf(TRPCError);
    expect(error).toMatchObject({ code: 'BAD_REQUEST' });
    expect(error.cause.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ['profile', 'age'] }),
      ]),
    );
  });

  it('awaits asynchronous Vest validation', async () => {
    const router = createAsyncRouter(async username => username !== 'taken');
    const caller = router.createCaller({});

    await expect(
      caller.reserveUsername({ username: 'taken' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

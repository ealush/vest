import { initTRPC, type inferRouterInputs } from '@trpc/server';
import { create, enforce, test } from 'vest';

const accountSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({ age: enforce.isNumeric().toNumber() }),
});

const usernameSchema = enforce.shape({
  username: enforce.isString().trim(),
});

export const accountSuite = create(data => {
  test('profile.age', 'Must be at least 18', () => {
    enforce(Number(data.profile.age)).greaterThanOrEquals(18);
  });
  test('email', 'Use an example.com email', () => {
    enforce(data.email.trim().toLowerCase()).endsWith('@example.com');
  });
}, accountSchema);

const trpc = initTRPC.create();

export const appRouter = trpc.router({
  createAccount: trpc.procedure.input(accountSuite).mutation(({ input }) => ({
    account: input,
    accepted: true as const,
  })),
});

export type AppRouter = typeof appRouter;

export async function createAccount(
  input: inferRouterInputs<AppRouter>['createAccount'],
) {
  return appRouter.createCaller({}).createAccount(input);
}

export function createAsyncRouter(
  isAvailable: (username: string) => Promise<boolean>,
) {
  const usernameSuite = create(data => {
    test('username', 'Username is already taken', async () => {
      enforce(await isAvailable(data.username)).isTruthy();
    });
  }, usernameSchema);

  return trpc.router({
    reserveUsername: trpc.procedure
      .input(usernameSuite)
      .mutation(({ input }) => input),
  });
}

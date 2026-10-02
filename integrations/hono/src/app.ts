import { sValidator } from '@hono/standard-validator';
import { Hono } from 'hono';
import { create, enforce, test } from 'vest';

const requestSchema = enforce.shape({
  email: enforce.isString().trim().toLower(),
  profile: enforce.shape({ age: enforce.isNumeric().toNumber() }),
});

const usernameSchema = enforce.shape({
  username: enforce.isString().trim(),
});

export const requestSuite = create(data => {
  test('profile.age', 'Must be at least 18', () => {
    enforce(Number(data.profile.age)).greaterThanOrEquals(18);
  });
  test('email', 'Use an example.com email', () => {
    enforce(data.email.trim().toLowerCase()).endsWith('@example.com');
  });
}, requestSchema);

export function createApp() {
  return new Hono().post(
    '/accounts',
    sValidator('json', requestSuite),
    sValidator('json', requestSchema),
    context => context.json({ account: context.req.valid('json') }, 201),
  );
}

export function createAsyncApp(
  isAvailable: (username: string) => Promise<boolean>,
) {
  const suite = create(data => {
    test('username', 'Username is already taken', async () => {
      enforce(await isAvailable(data.username)).isTruthy();
    });
  }, usernameSchema);
  return new Hono().post(
    '/usernames',
    sValidator('json', suite),
    sValidator('json', usernameSchema),
    context => context.json(context.req.valid('json')),
  );
}

export async function requestAccount(input: unknown) {
  const response = await createApp().request('/accounts', {
    body: JSON.stringify(input),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
  return { body: await response.json(), status: response.status };
}

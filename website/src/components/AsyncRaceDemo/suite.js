import { create, enforce, test } from 'vest';

export const RACE_STEPS = [
  { username: 'evy', delayMs: 1400 },
  { username: 'evyat', delayMs: 850 },
  { username: 'evyatar', delayMs: 300 },
];

const TAKEN_USERNAMES = new Set(['admin', 'evy', 'root', 'taken']);

const defaultWait = delayMs =>
  new Promise(resolve => window.setTimeout(resolve, delayMs));

export function getSimulatedDelay(username) {
  const hash = Array.from(username).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return 450 + (hash % 5) * 180;
}

export function createSignupSuite({
  onRequestStart = () => {},
  onRequestComplete = () => {},
  wait = defaultWait,
} = {}) {
  return create((data = {}) => {
    test('email', 'Enter a valid email address', () => {
      enforce(data.email).matches(/^\S+@\S+\.\S+$/);
    });

    test('username', 'Username must be at least 3 characters', () => {
      enforce(data.username).longerThanOrEquals(3);
    });

    test('username', 'That username is already taken', async ({ signal }) => {
      const request = {
        delayMs: data.delayMs ?? getSimulatedDelay(data.username ?? ''),
        generation: data.generation,
        id: data.requestId,
        username: data.username ?? '',
      };

      onRequestStart(request);
      await wait(request.delayMs);

      const available = !TAKEN_USERNAMES.has(
        request.username.trim().toLowerCase(),
      );

      onRequestComplete({
        ...request,
        available,
        stale: signal.aborted,
      });

      enforce(available).isTruthy();
    });
  });
}

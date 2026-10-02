import { describe, expect, it } from 'vitest';

import { parseEnvironment, readClientEnvironment } from './env';

describe('Vest with T3 Env', () => {
  it('parses and transforms valid environment values', () => {
    expect(
      parseEnvironment({
        API_URL: 'https://vestjs.dev',
        PORT: '3000',
        PUBLIC_APP_NAME: '  Vest demo  ',
      }),
    ).toMatchObject({
      API_URL: 'https://vestjs.dev',
      PORT: 3000,
      PUBLIC_APP_NAME: 'Vest demo',
    });
  });

  it.each([
    [{ API_URL: undefined, PORT: '3000', PUBLIC_APP_NAME: 'Vest' }],
    [{ API_URL: 'not a url', PORT: 'three', PUBLIC_APP_NAME: 'Vest' }],
  ])('rejects missing or malformed values', runtimeEnv => {
    expect(() => parseEnvironment(runtimeEnv)).toThrow();
  });

  it('prevents client access to server-only values', () => {
    const env = readClientEnvironment({
      PUBLIC_APP_NAME: 'Vest',
      SECRET: 'server-only',
    });

    expect(env.appName).toBe('Vest');
    expect(env.readSecret).toThrow('Attempted to access a server-side');
  });
});

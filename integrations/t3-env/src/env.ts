import { createEnv } from '@t3-oss/env-core';
import { enforce } from 'vest';
import 'vest/isURL';

export function parseEnvironment(
  runtimeEnv: Record<string, string | undefined>,
) {
  return createEnv({
    client: {
      PUBLIC_APP_NAME: enforce.isString().trim(),
    },
    clientPrefix: 'PUBLIC_',
    emptyStringAsUndefined: true,
    isServer: true,
    onValidationError: issues => {
      throw new Error('Invalid environment', { cause: issues });
    },
    runtimeEnv,
    server: {
      API_URL: enforce.isURL(),
      PORT: enforce.isNumeric().toNumber(),
    },
  });
}

export function readClientEnvironment(
  runtimeEnv: Record<string, string | undefined>,
) {
  const env = createEnv({
    client: { PUBLIC_APP_NAME: enforce.isString().trim() },
    clientPrefix: 'PUBLIC_',
    isServer: false,
    runtimeEnv,
    server: { SECRET: enforce.isString() },
  });

  return {
    appName: env.PUBLIC_APP_NAME,
    readSecret: () => env.SECRET,
  };
}

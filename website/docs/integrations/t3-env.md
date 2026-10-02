---
title: Vest with T3 Env
description: Tested runtime and type compatibility between Vest and T3 Env.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

# Vest with T3 Env

T3 Env accepts Standard Schema validators for individual environment variables. Vest's Enforce schemas validate server and client configuration and return parsed values such as a numeric port.

## Installation

```shell
npm install vest @t3-oss/env-core
```

The compatibility workspace pins @t3-oss/env-core 0.13.11 and imports only public package entry points.

## Implementation example

This source is exercised by the runtime and compile-time checks in the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/t3-env).

```ts
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
```

## Tested versions

- Vest 6.3.2
- @t3-oss/env-core 0.13.11

## Proven capabilities

- input inference
- multiple issues
- output inference
- synchronous
- transformed output

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- T3 Env validates each variable independently, so Enforce schemas are a more natural fit than a stateful Vest suite.
- Environment parsing is a one-shot configuration boundary rather than an interactive workflow.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.

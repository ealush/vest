---
title: Vest with Hono
description: Tested runtime and type compatibility between Vest and Hono.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

import HonoIntegration from '@site/src/components/Sandpack/HonoIntegration';

# Vest with Hono

Hono's Standard Validator middleware accepts a Vest suite directly. The local proof executes in-memory requests, rejects invalid JSON before the handler, and passes parsed output to valid handlers.

## Installation

```shell
npm install vest hono @hono/standard-validator
```

The compatibility workspace pins Hono 4.13.0; @hono/standard-validator 0.3.0 and imports only public package entry points.

## Runnable demonstration

The playground loads the suite, Enforce schema, consumer normalization function, and React demo directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/hono). Edit the JSON and switch validation surfaces to inspect their normalized Standard Schema results.

<HonoIntegration />

## Tested versions

- Vest 6.3.2
- Hono 4.13.0; @hono/standard-validator 0.3.0

## Proven capabilities

- asynchronous
- input inference
- multiple issues
- nested paths
- output inference
- synchronous
- transformed output

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- Standard Schema middleware validates complete requests and does not expose Vest stateful interaction features.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.

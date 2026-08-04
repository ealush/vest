---
title: Vest with TanStack Form
description: Tested runtime and type compatibility between Vest and TanStack Form.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

import TanStackFormIntegration from '@site/src/components/Sandpack/TanStackFormIntegration';

# Vest with TanStack Form

TanStack Form accepts a Vest suite directly as a form-level Standard Schema validator. TanStack owns field state and submission mechanics while Vest validates the complete payload.

## Installation

```shell
npm install vest @tanstack/react-form
```

The compatibility workspace pins @tanstack/react-form 1.33.3 and imports only public package entry points.

## Runnable demonstration

The playground loads the suite, Enforce schema, consumer normalization function, and React demo directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/tanstack-form). Edit the JSON and switch validation surfaces to inspect their normalized Standard Schema results.

<TanStackFormIntegration />

## Tested versions

- Vest 6.3.2
- @tanstack/react-form 1.33.3

## Proven capabilities

- input inference
- multiple issues
- nested paths
- synchronous

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- Generic Standard Schema validation does not use Vest focused execution or retained state.
- TanStack Form validates Standard Schema output but does not forward transformed output to the submit callback.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.

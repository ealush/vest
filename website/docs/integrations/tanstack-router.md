---
title: Vest with TanStack Router
description: Tested runtime and type compatibility between Vest and TanStack Router.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

import TanStackRouterIntegration from '@site/src/components/Sandpack/TanStackRouterIntegration';

# Vest with TanStack Router

TanStack Router accepts a Vest Enforce schema directly as a Standard Schema search-parameter validator. The route rejects invalid URLs and exposes Vest's parsed output as its inferred search type.

## Installation

```shell
npm install vest @tanstack/react-router
```

The compatibility workspace pins @tanstack/react-router 1.170.18 and imports only public package entry points.

## Runnable demonstration

The playground loads its tested source directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/tanstack-router). Edit the URL and use the file tabs to inspect search validation and inferred parsed values.

<TanStackRouterIntegration />

## Tested versions

- Vest 6.3.2
- @tanstack/react-router 1.170.18

## Proven capabilities

- input inference
- output inference
- synchronous
- transformed output

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- TanStack Router requires search validation to be synchronous.
- Search parsing is one-shot boundary validation and does not expose Vest stateful interaction features.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.

---
title: Vest with TanStack Form
description: Tested runtime and type compatibility between Vest and TanStack Form.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

import TanStackFormIntegration from '@site/src/components/Sandpack/TanStackFormIntegration';

# Vest with TanStack Form

TanStack Form owns field state while an instance-owned Vest suite provides focused change validation and Standard Schema submission validation.

## Installation

```shell
npm install vest @tanstack/react-form
```

The compatibility workspace pins @tanstack/react-form 1.33.3 and imports only public package entry points.

## Runnable demonstration

The playground loads its tested source directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/tanstack-form). Edit either field and use the file tabs to inspect focused change validation and full-form submission validation.

<TanStackFormIntegration />

## Tested versions

- Vest 6.3.2
- @tanstack/react-form 1.33.3

## Proven capabilities

- focused execution
- input inference
- multiple issues
- nested paths
- retained state
- synchronous

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- TanStack Form's generic Standard Schema submission validation does not expose Vest's focused execution or retained state; the field validators use the Suite Object API directly.
- TanStack Form validates Standard Schema output but does not forward transformed output to the submit callback.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.

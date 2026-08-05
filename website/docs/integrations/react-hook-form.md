---
title: Vest with React Hook Form
description: Tested runtime and type compatibility between Vest and React Hook Form.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

import ReactHookFormIntegration from '@site/src/components/Sandpack/ReactHookFormIntegration';

# Vest with React Hook Form

This local resolver connects React Hook Form to a stateful Vest 6 suite and returns transformed submission data.

## Installation

```shell
npm install vest react-hook-form @hookform/resolvers @standard-schema/spec
```

The compatibility workspace pins react-hook-form 7.84.0 and @hookform/resolvers 5.7.1 and imports only public package entry points.

## Runnable demonstration

The playground loads its tested source directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/integrations/react-hook-form). Edit the form to see focused validation, field arrays, asynchronous checks, and transformed submission data.

<ReactHookFormIntegration />

## Tested versions

- Vest 6.3.2
- react-hook-form 7.84.0 and @hookform/resolvers 5.7.1

## Proven capabilities

- asynchronous
- focused execution
- input inference
- multiple issues
- nested paths
- output inference
- race safety
- retained state
- synchronous
- transformed output

Runtime tests, compile-time inference tests, and the browser build run through `yarn integrations:verify`.

## Known limitations

- The resolver candidate exists only in this Vest workspace and is not yet available from @hookform/resolvers/vest.
- React Hook Form does not identify submission calls explicitly; unregistered default values and empty containers can make the full-run heuristic ambiguous.
- Vest Suite Objects do not expose a cloning API, so the candidate requires a suite factory to isolate full-form calls from retained focused state.
- Retained field-array state requires stable item IDs, supplied by getContactKey in this example.
- When an unrelated invalid field prevents whole-form transformation during a focused run, the resolver preserves the current input; full-form runs still require and return parsed output.
- RHF reset and unmount events are not part of the Resolver contract, so the local integration owner aborts and replaces its suite explicitly; asynchronous checks must honor their AbortSignal.

## Upstream status

No upstream change has been created. This page and the local workspace are the Vest-owned proof.

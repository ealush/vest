---
title: Ecosystem Integrations
description: Continuously tested Vest compatibility with TypeScript ecosystem tools.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

# Ecosystem Integrations

Every listed integration is backed by a private local workspace that imports the real consumer package, runs runtime and type checks, and builds its documented example. An upstream contribution is proposed only after the Vest-side proof is green.

Standard Schema entries prove full-payload interoperability. Focused execution, retained state, and race coordination are listed only when an integration directly exercises Vest's native Suite Object API.

## Specifications and interoperability

| Integration                                           | Status      | Tested versions                         | Mechanism       | Runtime | Types | Demo | Upstream                                                          |
| ----------------------------------------------------- | ----------- | --------------------------------------- | --------------- | ------- | ----- | ---- | ----------------------------------------------------------------- |
| [Standard Schema](/docs/integrations/standard-schema) | upstream-pr | Vest 6.3.2; @standard-schema/spec 1.0.0 | standard-schema | ✅      | ✅    | ✅   | [PR](https://github.com/standard-schema/standard-schema/pull/177) |

## Form state and framework forms

| Integration                                       | Status     | Tested versions                         | Mechanism            | Runtime | Types | Demo | Upstream   |
| ------------------------------------------------- | ---------- | --------------------------------------- | -------------------- | ------- | ----- | ---- | ---------- |
| [TanStack Form](/docs/integrations/tanstack-form) | docs-green | Vest 6.3.2; @tanstack/react-form 1.33.3 | native-plus-standard | ✅      | ✅    | ✅   | Not opened |

## Server and APIs

| Integration                     | Status     | Tested versions                                         | Mechanism       | Runtime | Types | Demo | Upstream   |
| ------------------------------- | ---------- | ------------------------------------------------------- | --------------- | ------- | ----- | ---- | ---------- |
| [Hono](/docs/integrations/hono) | docs-green | Vest 6.3.2; Hono 4.13.0; @hono/standard-validator 0.3.0 | standard-schema | ✅      | ✅    | ✅   | Not opened |
| [tRPC](/docs/integrations/trpc) | docs-green | Vest 6.3.2; @trpc/server 11.18.0                        | standard-schema | ✅      | ✅    | ✅   | Not opened |

## Routers and actions

| Integration                                           | Status     | Tested versions                             | Mechanism       | Runtime | Types | Demo | Upstream   |
| ----------------------------------------------------- | ---------- | ------------------------------------------- | --------------- | ------- | ----- | ---- | ---------- |
| [TanStack Router](/docs/integrations/tanstack-router) | docs-green | Vest 6.3.2; @tanstack/react-router 1.170.18 | standard-schema | ✅      | ✅    | ✅   | Not opened |

## Configuration

| Integration                         | Status     | Tested versions                      | Mechanism       | Runtime | Types | Demo | Upstream   |
| ----------------------------------- | ---------- | ------------------------------------ | --------------- | ------- | ----- | ---- | ---------- |
| [T3 Env](/docs/integrations/t3-env) | docs-green | Vest 6.3.2; @t3-oss/env-core 0.13.11 | standard-schema | ✅      | ✅    | ✅   | Not opened |

## Data and transport

_No local integration has been registered in this category yet._

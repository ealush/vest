---
sidebar_position: 1
title: Talks and Articles About Vest
description: 'Watch and read the ideas behind Vest: test-like suites, focused validation, async work, and client-server validation.'
keywords: [Vest talks, form validation, async validation, React Server Actions]
---

# Talks and Articles About Vest

Vest has grown from a simple observation: a form is not a payload that appears all at once. It is an interaction that unfolds field by field.

The resources below are good companions to the docs when you want the reasoning, demos, and trade-offs behind the API.

## Start here

- [Vest.js Validation Framework](https://www.youtube.com/watch?v=E3H5xN3L-GQ) is a recent Vest 6 session from Frontendistim. It covers the interaction-first model and the rewrite behind Vest 6. The session is in Hebrew.
- [Full Stack Form Validation with React Server Actions](https://www.youtube.com/watch?v=opzHOooNyZE) shows how one suite can serve focused browser validation and independent server requests.
- [Re-Form the Future: Rethinking Form Validations in React](https://www.youtube.com/watch?v=Toa1aLVOE9Q) is a live-coding walkthrough of focused runs, async checks, and cross-field rules.

## The recurring idea

The talks return to the same mapping:

| Form work          | Test-like model |
| ------------------ | --------------- |
| A form or workflow | A suite         |
| A field or step    | A named test    |
| A rule             | An assertion    |
| A changed field    | A focused run   |

That mental model explains the API, but the important behavior is state. In an interactive application, use `suite.run()` to retain the validation results that are still relevant. On the server, use `suite.runStatic()` for an isolated request.

Read [How Vest handles validation](../concepts.md) for the model, [focused validation](../guides/focused-validation.md) for the browser flow, and [client and server validation](../guides/client-server-validation.md) for the boundary between the two.

## More to watch and read

- [Better Form Validation with Vest](https://compressed.fm/episode/161), a conversation about stateful validation, framework independence, and maintaining an open-source library.
- [What if your JavaScript Validations Looked like Tests?](https://dev.to/jsjabber/what-if-your-javascript-validations-looked-like-tests-jsj-597), a JavaScript Jabber conversation about the test-suite model and the costs of API design.
- [Using Tests for What?!](https://gitnation.com/contents/using-tests-for-what), a TestJS Summit session that builds a full validation flow with synchronous, conditional, warning, and asynchronous rules.
- [Vue Form Validations with Vest](https://gitnation.com/contents/vue-form-validations-with-vest), a framework example that demonstrates the same suite model in Vue.
- [Creating APIs for the human developer](https://medium.com/fiverr-engineering/creating-apis-for-the-human-developer-c0f51a6d9366), the broader API-design philosophy behind familiar, maintainable tools.

## Keep the docs close

Use the videos for context, then return to the runnable guides. Every current tutorial is linked from [Vest Tutorials](../tutorials.md), and the [complete registration example](../guides/production-architecture.md) puts the core pieces together in one application.

# Vest Devtools Chrome Extension

This package provides a manifest v3 Chrome extension for inspecting Vest suite
activity in an event-based log, similar to Redux DevTools. The panel UI is built
with React 19, Zustand, TanStack Query, and Emotion.

## Load the extension

1. Build or clone this repo.
2. Run `yarn workspace vest-devtools-extension build`.
3. Open **chrome://extensions**.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select `packages/vest-devtools-extension/dist`.

## Register a suite

The extension listens for registered suites and uses `suite.subscribe` for
events plus `suite.get()` for state snapshots.

```ts
import vest from 'vest';

const suite = vest.create((data) => {
  // validations...
});

if (window.__VEST_DEVTOOLS__) {
  window.__VEST_DEVTOOLS__.registerSuite(suite, { name: 'signup' });
}
```

## What you’ll see

- Event log (one row per Vest event).
- Suite summary (validity, counts).
- Field status (passing, failing, pending, warning, idle).
- Last input parameters used to run the suite.

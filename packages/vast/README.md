# Vast - Simple State Utility for Libraries

Vast is a tiny state container inspired by React's `useState`, designed for libraries that need predictable, reusable state without a UI framework.

- Register any number of state keys, each with its own getter/setter pair.
- Provide global `onStateChange` and per-key `onUpdate` callbacks to react to changes.
- Reset state back to initial values at any time.

## Installation

```bash
npm i vast
```

## Usage

```js
import { createState } from 'vast';

// Optional callback runs on every state change
const state = createState(() => console.log('state changed'));

// Create a key with an initial value
const useColor = state.registerStateKey('blue');

const [color, setColor] = useColor();
setColor('red');

// Next call returns the updated value
const [current] = useColor();
// current === 'red'
```

The setter accepts either a value or an updater function that receives the current state value:

```js
const [count, setCount] = state.registerStateKey(0)();
setCount(prev => prev + 1);
```

## Subscriptions

- `onStateChange` (passed to `createState`) fires after every update to any key.
- `onUpdate` (passed to `registerStateKey`) fires for that key when it initializes and whenever it changes, receiving `(current, previous)`.

```js
const logColorChange = (next, prev) => console.log(`color: ${prev} -> ${next}`);
const useColor = state.registerStateKey('blue', logColorChange);

useColor()[1]('green');
// logs: color: blue -> green
```

`onUpdate` is invoked before the global `onStateChange`, matching the library's execution order.

## Resetting state

Call `state.reset()` to restore every registered key to its initial value. Setters still work after a reset:

```js
state.reset();
const [color, setColor] = useColor();
setColor('purple');
```

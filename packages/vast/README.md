# Vast - Simple State Utility for Libraries

Vast is a simple state utility created to use in [Vest](https://github.com/ealush/vest). It allows using a similar pattern to React's useState hook to store data.

Note that this is mostly intended to be used within libraries, and not as a consumer facing interface. When paired with a context propagation libraries such as [context](https://github.com/ealush/context), it can have pretty powerful capabilities. See Vest for a real life example.

## Installation

```
npm i vast
```

## Usage

```js
import { createState } from 'vast';

const state = createState(); // Creates a state reference.

const useColor = state.registerStateKey('blue'); // Creates a new key in the state, and gives it an initial value
// You can also pass in a function to use as the initial state

const [color, setColor] = useColor(); // ["blue", Function]
setColor('red'); // set the color to "red"
```

The next time you will call `useColor` the value of `color` will be `"red"`.

You can also set a computed value by passing in a function:

```js
const [color, setColor] = useColor(); // ["blue", Function]
setColor(currentColor => (color === 'red' ? 'blue' : 'red'));
```

## Subscribing to changes

### Getting notified for every change in the state

**NOTE** This will not let you know what change was made, but only that a key in the state was updated or added:

Simply add an onChange callback to your createState:

```js
const state = createState(() => console.log('the state was updated!'));
```

Now on every state change, this callback will run.

Alternatively, if you need more granularity, you can subscribe to specific state keys.

### Subscribing to specific state key updates

If you need to react to specific changes in your state, you can add an `onUpdate` callback to those state key registrations:

```js
const useColor = state.registerStateKey(
  'red',
  (currentState, previousState) => {
    console.log(`the color changed from ${previousState} to ${currentState}!`);
  },
);
```

Now, whenever a state update happens in that key, your callback will run, providing the previous and changed value as well.

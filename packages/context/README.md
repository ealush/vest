# Context

Simple utility that creates a multi-layered context singleton.
It allows you to keep reference for shared variables, and access them later down in your function call even if not declared in the same scope.

Originally built for [vest](https://github.com/ealush/vest) validation framework.

# The Concepts

Lets take a quick look at how this would work

```js
import createContext from 'context';

const context = createContext();

context.run({ name: 'Sam' }, sayMyName);
context.run({ name: 'David' }, sayMyName);

function sayMyName() {
  const { name } = context.use();
  console.log(`My Name is ${name}`);
}
```

This will print:

My Name is Sam
My Name is David

So as we see 'run' allows us to run a function and access the specific variable we assigned to the object.

Why is this useful? Why not just do

```js
sayMyName('Sam');
sayMyName('David');

function sayMyName(name) {
  console.log(`My Name is ${name}`);
}
```

We will be getting the same results. Right?

It's the next feature that illustrates context's power.
Instead of using 'run'. we will use 'bind'

```js
// getNames.js

import createContext from 'context';

const context = createContext();

const samName = context.bind({ name: 'Sam' }, sayMyName);
const davidName = context.bind({ name: 'David' }, sayMyName);

function sayMyName() {
  const { name } = context.use();
  console.log(`My Name is ${name}`);
}

export { samName, davidName };

//index.js

samName();
davidName();
```

This will once again print

My Name is Sam
My Name is David

Except now, because context is a singleton anywhere we run these functions they will print those values.

What if we want to share a value between these functions?
We can initialize createContext with a value

```js
// getNames.js

import createContext from 'context';

const context = createContext((ctx, parentCtx) => {
  return Object.assign({}, ctx, { lastName: 'Smith' });
});

const samName = context.bind({ name: 'Sam' }, sayMyName);
const davidName = context.bind({ name: 'David' }, sayMyName);

function sayMyName() {
  const { name, lastName } = context.use();
  console.log(`My Name is ${name} ${lastName}`);
}

export { samName, davidName };

//index.js

samName();
davidName();
```

will print

My Name is Sam Smith
My Name is David Smith

These example are pretty contrived

Lets try something a little more real world.

# Real World Example

What if we wanted to keep track of how many times a function was called.
We want to create an environment where we pass the function we want to track and receive exactly the same function.
The only difference is that the function is going to have a count property which we will be able to call at any time.

So lets start

```js
//counter.js
import createContext from 'context';

const context = createContext();
```

We've seen this before, we are creating the context object.

Now I want to have a main context that will store the values of all the functions that are running.
in context world it will look like this.
Just a parent function called counter.

```js
//counter.js
import createContext from 'context';

const context = createContext();

function counter() {}
```

In this function I am going to want to store the function name and the count.
I add a couple of functions add and getVals.

```js
//counter.js
import createContext from 'context';

const context = createContext();

function counter() {
  const values = {};

  function add(val) {
    if (!values[val]) {
      values[val] = 0;
    }

    values[val] += 1;
  }

  function getVals() {
    return values;
  }
}
```

At this stage it won't accomplish much.
What I want counter to return is a function that holds 'values' in its context. We will use context.bind for that.
So imagine a box and counter is the outer most box. In it is the values object and anything I put into the box will have access to that object.
and what do I want to put in the box? The function I want to count.

I add an argument func to counter.
This will be the function we want to count.
I create a ref object which I will then pass to the function.
This object is accessible to the the function thanks to context.

```js
//counter.js
import createContext from 'context';

const context = createContext();

function counter(func) {
  const values = {};

  function add(val) {
    if (!values[val]) {
      values[val] = 0;
    }

    values[val] += 1;
  }

  function getVals() {
    return values;
  }

  const ref = { add, getVals };
  return context.bind({ ref }, func);
}
```

great! wait no, this function that is returned will run our function we passed and it does have access to values but in order to use values we have to modify our function!

Not what we wanted...

We want a function that will run our function, have access to values but won't require us to modify our existing function.

so lets create a function called track.
'track' will return a function that will modify values and run out function

```js
//counter.js
function track(func) {
  const { ref } = context.use();

  function holder(args) {
    ref.add(func.name);
    holder.count = ref.getVals()[func.name];
    holder.getAll = () => {
      return ref.getVals();
    };
    return func(args);
  }

  return holder;
}
```

In 'track' I am using context.use and I can do this because I am going to pass it to context.bind. If I didn't run it in either context.run or context.bind this will not work. It basically is looking for the outer box.

I pull out ref which holds the reference to values.

The function 'holder' is going to run 'add' from ref and since functions in javascript are object we are going to pass the resulting value into a 'count' property.
We are also creating a getAll function to the function.
Then our function will run and the result will return as if no change was ever made.

```js
//counter.js
import createContext from 'context';

const context = createContext();

function track(func) {
  const { ref } = context.use();

  function holder(args) {
    ref.add(func.name);
    holder.count = ref.getVals()[func.name];
    holder.getAll = () => {
      return ref.getVals();
    };
    return func(args);
  }

  return holder;
}

function counter(tracker) {
  const values = {};

  function add(val) {
    if (!values[val]) {
      values[val] = 0;
    }

    values[val] += 1;
  }

  function getVals() {
    return values;
  }

  const ref = { add, getVals };

  return context.bind({ ref }, tracker); //
}

export { counter, track };
```

Lets see how we use this.

```js
// index.js
import { counter, track } from './counter';

const countIt = counter(func => {
  return track(func);
});

function goToServer() {
  console.log('going to server');
}

function readFile(file) {
  console.log('readingFile ' + file);
}
const dReadFile = countIt(readFile);
const dgoToServer = countIt(goToServer);

readFile('important.docx');

dReadFile('mainfile.js');
dReadFile('secondary.js');
console.log(dReadFile.count);

dgoToServer();
console.log(dgoToServer.count);

console.log(dReadFile.getAll());
```

Imagine a situation where you have functions that are trying to reach a server and read a file.

We don't want to modify them but create a wrapper function to keep track
of how many times it runs.

So to create our first box we have the counter function.
It stores the values and receives a deferred anonymous function.
We are passing our function the anonymous function which then gets passed to the tracker function.
The tracker function receives our function runs the count returns the result of our function

We assign this wrapper to the variable countIt.

We pass readFile to countIt and create a new function dReadFile

When we run dReadFile it will behave like readFile but will store the count within.

Since context is a singleton anywhere we run this function within our project it will keep correct track of our count.

# Other Examples

```js
// myContext.js
import createContext from 'context';

export default createContext();
```

```js
// framework.js

import context from './myContext.js';

function suite(id, tests) {
  context.run({ suiteId: id }, () => tests()); // ...
}

function group(name, groupTests) {
  const { suiteId } = context.use();

  context.run(
    {
      group: name,
    },
    () => groupTests()
  );
}

function test(message, cb) {
  const { suiteId, group } = context.use();

  const testId = Math.random(); // 0.8418151199238901

  const testData = context.run({ test: testId }, () => cb()); // ...
}

export { suite, group, test } from './framework';
```

```js
import testFramework from './framwork.js';

suite('some_id', () => {
  /*
    context now is:
    {
      suiteId: 'some_id'
    }
 */

  group('some_group_name', () => {
    /*
      context now is:
      {
        group: 'some_group_name',
        parentContext: {
          suiteId: 'some_id',
        }
      }
     */

    test('blah blah', () => {
      /*
          context now is:
          {
            test: 0.8418151199238901,
            parentContext: {
              group: 'some_group_name',
              parentContext: {
                suiteId: 'some_id',
              }
            }
          }
         */
    });
  });
});
```

## Binding a function with context

You can bind a function to a context with ctx.bind, this allows you to create a bound function that's when called - will be called with that bound context, even if not in the same scope anymore.

```js
const boundFunction = ctx.bind(ctxRef, fn, ...args);

boundFunction(); // Will run with the context as if you run it directly within ctx.run();
```

## Context initialization

You can add an init function to your context creation. The init function will run every time you call context.run, to allow you to set in-flight keys to your context. It accepts two params - the provided ctxRef, and the parent context when nested.

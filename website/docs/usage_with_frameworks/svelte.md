---
sidebar_position: 3
title: Svelte
---

# Using Vest with Svelte

Vest integrates naturally with Svelte's reactive stores and reactive statements, providing elegant validation for your forms.

## Quick Start

````svelte
<script>
  import { create, test, enforce } from 'vest';
  import { writable } from 'svelte/store';

  const suite = create((data = {}) => {
    test('username', 'Username is required', () => {
      enforce(data.username).isNotBlank();
    });

    test('username', 'Username must be at least 3 characters', () => {
      enforce(data.username).longerThanOrEquals(3);
    });

    test('email', 'Email is required', () => {
      enforce(data.email).isNotBlank();
    });

    test('email', 'Please enter a valid email', () => {
      enforce(data.email).isEmail();
    });
  });

  let formData = {
    username: '',
    email: ''
  };

  let result = suite.get();

  function validateField(fieldName) {
    suite.afterEach((res) => {
      result = res;
    }).run(formData, fieldName);
  }

  function handleSubmit() {
    suite.afterEach((res) => {
      result = res;

      if (!res.hasErrors()) {
        console.log('Form is valid!', formData);
      }
    }).run(formData);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div>
    <input
      bind:value={formData.username}
      on:input={() => validateField('username')}
      placeholder="Username"
    />
    {#if result.hasErrors('username')}
      <span class="error">{result.getErrors('username')[0]}</span>
    {/if}
  </div>

  <div>
    <input
      bind:value={formData.email}
      on:input={() => validateField('email')}
      type="email"
      placeholder="Email"
    />
    {#if result.hasErrors('email')}
      <span class="error">{result.getErrors('email')[0]}</span>
    {/if}
  </div>

  <button type="submit" disabled={result.hasErrors()}>
    Submit
  </button>
</form>

<style>
  .error {
    color: red;
    font-size: 0.875rem;
  }
</style>

## Using Svelte Stores

Create a reactive store for your validation results:

```svelte
<script>
  import { writable, derived } from 'svelte/store';
  import { create, test, enforce } from 'vest';

  const suite = create((data = {}) => {
    test('email', 'Email is required', () => {
      enforce(data.email).isNotBlank();
    });

    test('password', 'Password must be at least 8 characters', () => {
      enforce(data.password).longerThanOrEquals(8);
    });
  });

  const formData = writable({
    email: '',
    password: ''
  });

  const validationResult = writable(suite.get());

  // Derived store for form validity
  const isFormValid = derived(
    validationResult,
    $result => !$result.hasErrors()
  );

  function validateField(fieldName, value) {
    formData.update(data => ({ ...data, [fieldName]: value }));

    suite.afterEach((res) => {
      validationResult.set(res);
    }).run($formData, fieldName);
  }

  function handleSubmit() {
    suite.afterEach((res) => {
      validationResult.set(res);

      if (!res.hasErrors()) {
        console.log('Submitting:', $formData);
      }
    }).run($formData);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input
    value={$formData.email}
    on:input={(e) => validateField('email', e.target.value)}
    type="email"
  />
  {#if $validationResult.hasErrors('email')}
    <span>{$validationResult.getErrors('email')[0]}</span>
  {/if}

  <button type="submit" disabled={!$isFormValid}>
    Submit
  </button>
</form>

## Reactive Statements

Use Svelte's reactive statements for automatic validation:

```svelte
<script>
  import { create, test, enforce } from 'vest';

  const suite = create((data = {}) => {
    test('username', 'Username is required', () => {
      enforce(data.username).isNotBlank();
    });
  });

  let username = '';
  let result = suite.get();

  // Automatically validate when username changes
  $: if (username !== undefined) {
    suite.afterEach((res) => {
      result = res;
    }).run({ username }, 'username');
  }
</script>

<input bind:value={username} placeholder="Username" />
{#if result.hasErrors('username')}
  <span>{result.getErrors('username')[0]}</span>
{/if}
````

## Async Validation

Handle async validations with Svelte's reactivity:

```svelte
<script>
  import { create, test, enforce } from 'vest';

  const suite = create((data = {}) => {
    test('username', 'Username is required', () => {
      enforce(data.username).isNotBlank();
    });

    test('username', 'Username is already taken', async () => {
      await enforce(data.username).isNotBlank();

      const response = await fetch(`/api/check-username?username=${data.username}`);
      const { available } = await response.json();

      enforce(available).isTruthy();
    });
  });

  let username = '';
  let result = suite.get();
  let isChecking = false;

  async function checkUsername() {
    isChecking = true;

    suite.afterEach((res) => {
      result = res;
      isChecking = false;
    }).run({ username }, 'username');
  }

  // Debounced reactive check
  let debounceTimer;
  $: {
    clearTimeout(debounceTimer);
    if (username) {
      debounceTimer = setTimeout(checkUsername, 500);
    }
  }
</script>

<div>
  <input bind:value={username} placeholder="Choose a username" />
  {#if isChecking}
    <span>Checking availability...</span>
  {:else if result.hasErrors('username')}
    <span class="error">{result.getErrors('username')[0]}</span>
  {:else if result.isValid('username')}
    <span class="success">Username is available!</span>
  {/if}
</div>
```

## Felte Integration

Vest integrates with [Felte](https://felte.dev/), a popular form library for Svelte:

```bash
npm install felte @felte/validator-vest
```

```svelte
<script>
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-vest';
  import { create, test, enforce } from 'vest';

  const suite = create((data = {}) => {
    test('email', 'Email is required', () => {
      enforce(data.email).isNotBlank();
    });

    test('email', 'Please enter a valid email', () => {
      enforce(data.email).isEmail();
    });

    test('password', 'Password must be at least 8 characters', () => {
      enforce(data.password).longerThanOrEquals(8);
    });
  });

  const { form, errors, isValid } = createForm({
    extend: validator({ suite }),
    onSubmit: (values) => {
      console.log('Submitting:', values);
    }
  });
</script>

<form use:form>
  <div>
    <input name="email" type="email" />
    {#if $errors.email}
      <span>{$errors.email[0]}</span>
    {/if}
  </div>

  <div>
    <input name="password" type="password" />
    {#if $errors.password}
      <span>{$errors.password[0]}</span>
    {/if}
  </div>

  <button type="submit" disabled={!$isValid}>
    Login
  </button>
</form>
```

## Custom Validation Store

Create a reusable validation store:

```js
// stores/validation.js
import { writable, derived } from 'svelte/store';

export function createValidationStore(suite, initialData = {}) {
  const formData = writable(initialData);
  const result = writable(suite.get());
  const isValidating = writable(false);

  function validate(fieldName) {
    isValidating.set(true);

    const currentData = get(formData);
    suite
      .afterEach(res => {
        result.set(res);
        isValidating.set(false);
      })
      .run(currentData, fieldName);
  }

  function validateAll() {
    isValidating.set(true);

    const currentData = get(formData);
    suite
      .afterEach(res => {
        result.set(res);
        isValidating.set(false);
      })
      .run(currentData);
  }

  function updateField(fieldName, value) {
    formData.update(data => ({ ...data, [fieldName]: value }));
    validate(fieldName);
  }

  function reset() {
    formData.set(initialData);
    result.set(suite.get());
  }

  const isValid = derived(result, $result => !$result.hasErrors());

  return {
    formData,
    result,
    isValidating,
    isValid,
    validate,
    validateAll,
    updateField,
    reset,
  };
}
```

Usage:

```svelte
<script>
  import { create, test, enforce } from 'vest';
  import { createValidationStore } from './stores/validation';

  const suite = create((data = {}) => {
    test('username', 'Username is required', () => {
      enforce(data.username).isNotBlank();
    });
  });

  const {
    formData,
    result,
    isValid,
    updateField,
    validateAll,
    reset
  } = createValidationStore(suite, { username: '', email: '' });

  function handleSubmit() {
    validateAll();

    if ($isValid) {
      console.log('Submitting:', $formData);
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input
    value={$formData.username}
    on:input={(e) => updateField('username', e.target.value)}
  />
  {#if $result.hasErrors('username')}
    <span>{$result.getErrors('username')[0]}</span>
  {/if}

  <button type="submit" disabled={!$isValid}>Submit</button>
  <button type="button" on:click={reset}>Reset</button>
</form>
```

## TypeScript Support

Vest works great with [TypeScript](/docs/typescript_support) in Svelte:

````svelte
<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import { create, test, enforce, type SuiteResult } from 'vest';

  interface FormData {
    username: string;
    email: string;
    age: number;
  }

  const suite = create((data: Partial<FormData> = {}) => {
    test('username', 'Username is required', () => {
      enforce(data.username).isNotBlank();
    });

    test('age', 'Must be 18 or older', () => {
      enforce(data.age).greaterThanOrEquals(18);
    });
  });

  let formData: Partial<FormData> = {
    username: '',
    email: '',
    age: undefined
  };

  let result: SuiteResult = suite.get();

  function validateField(fieldName: keyof FormData): void {
    suite.afterEach((res) => {
      result = res;
    }).run(formData, fieldName);
  }
</script>

## Best Practices

### 1. Create Suite Outside Component

Define your validation suite in a separate file. Vest suites are stateful, so they should be treated as singletons for a given form.

```js
// validations/signupSuite.js
import { create, test, enforce } from 'vest';

export const signupSuite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
  // ... more tests
});
```

### 2. Debounce Expensive Validations

Use debouncing for async or expensive validations:

```svelte
<script>
  import { debounce } from './utils';

  const validateUsername = debounce((value) => {
    suite.afterEach(setResult).run({ username: value }, 'username');
  }, 500);

  $: validateUsername(username);
</script>
```

### 3. Show Errors After Touch

Only show errors after a field has been touched:

```svelte
<script>
  let touched = {
    username: false,
    email: false
  };

  function handleBlur(fieldName) {
    touched[fieldName] = true;
  }

  function shouldShowError(fieldName) {
    return touched[fieldName] && result.hasErrors(fieldName);
  }
</script>

<input
  bind:value={formData.username}
  on:blur={() => handleBlur('username')}
  on:input={() => validateField('username')}
/>
{#if shouldShowError('username')}
  <span>{result.getErrors('username')[0]}</span>
{/if}
```

## Next Steps

- Learn about [Core Concepts](/docs/concepts) to understand Vest's architecture
- Explore [Async Tests](/docs/writing_tests/async_tests) for handling asynchronous validations
- Check out [Skip and Only](/docs/writing_your_suite/including_and_excluding/skip_and_only) for complex validation scenarios

````

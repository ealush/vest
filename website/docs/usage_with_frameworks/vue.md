---
sidebar_position: 2
title: Vue
---

import VueIntegrationSandpack from '@site/src/components/Sandpack/VueIntegration';

# Using Vest with Vue

Vest integrates beautifully with Vue 3's Composition API and reactivity system, providing declarative validation for your forms.

## Interactive Example

Explore a live Vue 3 form wired to a Vest suite. Edit the component or the suite to see validation updates instantly.

<VueIntegrationSandpack />

## Quick Start with Composition API

```vue
<script setup>
import { ref, reactive } from 'vue';
import { create, test, enforce } from 'vest';

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

const formData = reactive({
  username: '',
  email: '',
});

const result = ref(suite.get());

const validateField = fieldName => {
  suite
    .afterEach(res => {
      result.value = res;
    })
    .run(formData, fieldName);
};

const handleSubmit = () => {
  suite
    .afterEach(res => {
      result.value = res;

      if (!res.hasErrors()) {
        // Submit form
        console.log('Form is valid!', formData);
      }
    })
    .run(formData);
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input
        v-model="formData.username"
        @input="validateField('username')"
        placeholder="Username"
      />
      <span v-if="result.hasErrors('username')" class="error">
        {{ result.getErrors('username')[0] }}
      </span>
    </div>

    <div>
      <input
        v-model="formData.email"
        @input="validateField('email')"
        type="email"
        placeholder="Email"
      />
      <span v-if="result.hasErrors('email')" class="error">
        {{ result.getErrors('email')[0] }}
      </span>
    </div>

    <button type="submit" :disabled="result.hasErrors()">Submit</button>
  </form>
</template>
```

## Composable Pattern

Create a reusable composable for form validation:

```js
// composables/useVestForm.js
import { ref, reactive, toRefs } from 'vue';

export function useVestForm(suite, initialData = {}) {
  const formData = reactive({ ...initialData });
  const result = ref(suite.get());
  const isValidating = ref(false);

  const validate = fieldName => {
    isValidating.value = true;

    suite
      .afterEach(res => {
        result.value = res;
        isValidating.value = false;
      })
      .run(formData, fieldName);
  };

  const validateAll = () => {
    isValidating.value = true;

    suite
      .afterEach(res => {
        result.value = res;
        isValidating.value = false;
      })
      .run(formData);
  };

  const reset = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = initialData[key] || '';
    });
    result.value = suite.get();
  };

  return {
    formData,
    result,
    isValidating,
    validate,
    validateAll,
    reset,
  };
}
```

Usage:

```vue
<script setup>
import { create, test, enforce } from 'vest';
import { useVestForm } from '@/composables/useVestForm';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
});

const { formData, result, validate, validateAll, reset } = useVestForm(suite, {
  username: '',
  email: '',
});

const handleSubmit = () => {
  validateAll();

  if (!result.value.hasErrors()) {
    // Submit form
    console.log('Submitting:', formData);
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.username" @input="validate('username')" />
    <span v-if="result.hasErrors('username')">
      {{ result.getErrors('username')[0] }}
    </span>

    <button type="submit" :disabled="result.hasErrors()">Submit</button>
    <button type="button" @click="reset">Reset</button>
  </form>
</template>
```

## Async Validation

Handle async validations with Vue's reactivity:

```vue
<script setup>
import { ref, reactive } from 'vue';
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username is already taken', async () => {
    await enforce(data.username).isNotBlank();

    const response = await fetch(
      `/api/check-username?username=${data.username}`,
    );
    const { available } = await response.json();

    enforce(available).isTruthy();
  });
});

const formData = reactive({ username: '' });
const result = ref(suite.get());
const isChecking = ref(false);

const checkUsername = () => {
  isChecking.value = true;

  suite
    .afterEach(res => {
      result.value = res;
      isChecking.value = false;
    })
    .run(formData, 'username');
};
</script>

<template>
  <div>
    <input
      v-model="formData.username"
      @input="checkUsername"
      placeholder="Choose a username"
    />
    <span v-if="isChecking">Checking availability...</span>
    <span v-else-if="result.hasErrors('username')" class="error">
      {{ result.getErrors('username')[0] }}
    </span>
    <span v-else-if="result.isValid('username')" class="success">
      Username is available!
    </span>
  </div>
</template>
```

## Options API Pattern

For Vue 2 or Options API users:

```vue
<script>
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('email', 'Please enter a valid email', () => {
    enforce(data.email).isEmail();
  });
});

export default {
  data() {
    return {
      formData: {
        email: '',
      },
      result: suite.get(),
    };
  },
  methods: {
    validateField(fieldName) {
      suite
        .afterEach(res => {
          this.result = res;
        })
        .run(this.formData, fieldName);
    },
    handleSubmit() {
      suite
        .afterEach(res => {
          this.result = res;

          if (!res.hasErrors()) {
            // Submit form
            console.log('Valid!', this.formData);
          }
        })
        .run(this.formData);
    },
  },
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="formData.email"
      @input="validateField('email')"
      type="email"
    />
    <span v-if="result.hasErrors('email')">
      {{ result.getErrors('email')[0] }}
    </span>

    <button type="submit" :disabled="result.hasErrors()">Submit</button>
  </form>
</template>
```

## Felte Integration

Vest integrates with [Felte](https://felte.dev/), a popular form library for Vue:

```bash
npm install felte @felte/validator-vest
```

```vue
<script setup>
import { createForm } from 'felte';
import { validator } from '@felte/validator-vest';
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('password', 'Password must be at least 8 characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
});

const { form, errors } = createForm({
  extend: validator({ suite }),
  onSubmit: values => {
    console.log('Submitting:', values);
  },
});
</script>

<template>
  <form ref="form">
    <input name="email" type="email" />
    <span v-if="errors.email">{{ errors.email[0] }}</span>

    <input name="password" type="password" />
    <span v-if="errors.password">{{ errors.password[0] }}</span>

    <button type="submit">Login</button>
  </form>
</template>
```

## TypeScript Support

Vest works great with [TypeScript](/docs/typescript_support) in Vue:

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { create, test, enforce, SuiteResult } from 'vest';

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

const formData = reactive<Partial<FormData>>({
  username: '',
  email: '',
  age: undefined,
});

const result = ref<SuiteResult>(suite.get());

const validateField = (fieldName: keyof FormData) => {
  suite
    .afterEach(res => {
      result.value = res;
    })
    .run(formData, fieldName);
};
</script>
```

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

```vue
<script setup>
import { signupSuite } from '@/validations/signupSuite';

// Use the suite
</script>
```

### 2. Debounce Async Validations

Use Vue's `watchDebounced` or a debounce utility for expensive validations:

```vue
<script setup>
import { ref, watchDebounced } from 'vue';

const username = ref('');

watchDebounced(
  username,
  newValue => {
    // Validate username
    suite.afterEach(setResult).run({ username: newValue }, 'username');
  },
  { debounce: 500 },
);
</script>
```

### 3. Show Errors After Touch

Only show errors after a field has been touched:

```vue
<script setup>
import { ref, reactive } from 'vue';

const touched = reactive({
  username: false,
  email: false,
});

const handleBlur = fieldName => {
  touched[fieldName] = true;
};

const shouldShowError = fieldName => {
  return touched[fieldName] && result.value.hasErrors(fieldName);
};
</script>

<template>
  <input
    v-model="formData.username"
    @blur="handleBlur('username')"
    @input="validate('username')"
  />
  <span v-if="shouldShowError('username')">
    {{ result.getErrors('username')[0] }}
  </span>
</template>
```

## Next Steps

- Learn about [Core Concepts](/docs/concepts) to understand Vest's architecture
- Explore [Async Tests](/docs/writing_tests/async_tests) for handling asynchronous validations
- Check out [Skip and Only](/docs/writing_your_suite/including_and_excluding/skip_and_only) for complex validation scenarios

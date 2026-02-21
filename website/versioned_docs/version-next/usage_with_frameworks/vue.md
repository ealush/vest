---
sidebar_position: 2
title: Vue
---

# Using Vest with Vue

Vest integrates beautifully with Vue 3's Composition API and reactivity system, providing declarative validation for your forms.

## Quick Start with Composition API

import VueIntegration from '@site/src/components/Sandpack/VueIntegration';

<VueIntegration />

```vue
<script setup>
import { ref, reactive } from 'vue';
import { create, test, enforce } from 'vest';
import 'vest/email';

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

const res = ref(suite.get());

const validateField = fieldName => {
  suite
    .only(fieldName)
    .afterEach(() => {
      res.value = suite.get();
    })
    .run(formData);
};

const handleSubmit = async () => {
  await suite.run(formData);

  if (suite.isValid()) {
    // Submit form
    console.log('Form is valid!', formData);
  }
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
      <span v-if="res.hasErrors('username')" class="error">
        {{ res.getError('username') }}
      </span>
    </div>

    <div>
      <input
        v-model="formData.email"
        @input="validateField('email')"
        type="email"
        placeholder="Email"
      />
      <span v-if="res.hasErrors('email')" class="error">
        {{ res.getError('email') }}
      </span>
    </div>

    <button type="submit" :disabled="!res.isValid()">Submit</button>
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
      .only(fieldName)
      .afterEach(() => {
        result.value = suite.get();
        isValidating.value = false;
      })
      .run(formData);
  };

  const validateAll = () => {
    isValidating.value = true;

    suite
      .afterEach(() => {
        result.value = suite.get();
        isValidating.value = false;
      })
      .run(formData);
  };

  const reset = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = initialData[key] || '';
    });
    suite.reset();
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
import 'vest/email';
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
    <span v-if="res.hasErrors('username')">
      {{ res.getError('username') }}
    </span>

    <button type="submit" :disabled="res.hasErrors()">Submit</button>
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
import 'vest/email';

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
    .only('username')
    .afterEach(() => {
      result.value = suite.get();
      isChecking.value = false;
    })
    .run(formData);
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
    <span v-else-if="res.hasErrors('username')" class="error">
      {{ res.getError('username') }}
    </span>
    <span v-else-if="res.isValid('username')" class="success">
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
import 'vest/email';

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
        .only(fieldName)
        .afterEach(() => {
          this.result = suite.get();
        })
        .run(this.formData);
    },
    handleSubmit() {
      suite
        .afterEach(() => {
          const res = suite.get();
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
    <span v-if="res.hasErrors('email')">
      {{ res.getError('email') }}
    </span>

    <button type="submit" :disabled="res.hasErrors()">Submit</button>
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
    .only(fieldName)
    .afterEach(() => {
      result.value = suite.get();
    })
    .run(formData);
};
</script>
```

## Best Practices

### 1. Create Suite Outside Component

Define your validation suite in a separate file. Vest suites are stateful, so they should be treated as singletons for a given form.

```js
// validations/signupSuite.js
import { create, test, enforce } from 'vest';
import 'vest/email';

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
    suite
      .only('username')
      .afterEach(() => setResult(suite.get()))
      .run({ username: newValue });
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
    {{ res.getError('username') }}
  </span>
</template>
```

## Next Steps

- Learn about [Core Concepts](/docs/concepts) to understand Vest's architecture
- Explore [Async Tests](/docs/writing_tests/async_tests) for handling asynchronous validations
- Check out [Skip and Only](/docs/writing_your_suite/including_and_excluding/skip_and_only) for complex validation scenarios

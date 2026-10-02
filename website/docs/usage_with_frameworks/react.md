---
sidebar_position: 1
title: React
---

# Using Vest with React

Vest suites do not depend on React. A component runs the suite when a value changes and renders the result from state. This guide shows the usual patterns.

## Quick Start

import ReactIntegration from '@site/src/components/Sandpack/ReactIntegration';

<ReactIntegration />

```jsx
import { create, test, enforce } from 'vest';
import 'vest/email';
import { useState } from 'react';

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

function SignupForm() {
  const [formData, setFormData] = useState({ username: '', email: '' });

  const handleChange = (name, value) => {
    const nextState = { ...formData, [name]: value };

    suite
      .only(name)
      .afterEach(() => setFormData(nextState))
      .run(nextState);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await suite.run(formData);

    if (suite.isValid()) {
      // Submit form
      console.log('Form is valid!', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={e => handleChange('username', e.target.value)}
        />
        {suite.hasErrors('username') && (
          <span>{suite.getError('username')}</span>
        )}
      </div>

      <div>
        <input
          name="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
        />
        {suite.hasErrors('email') && <span>{suite.getError('email')}</span>}
      </div>

      <button type="submit" disabled={!suite.isValid()}>
        Submit
      </button>
    </form>
  );
}
```

## Custom Hook Pattern

Create a reusable hook for form validation:

```jsx
import { useCallback, useState } from 'react';

function useVestForm(suite, initialData = {}) {
  const [formData, setFormData] = useState(initialData);

  const validate = useCallback(
    (fieldName, value) => {
      const newData = { ...formData, [fieldName]: value };
      suite
        .only(fieldName)
        .afterEach(() => {
          setFormData(newData);
        })
        .run(newData);
    },
    [formData, suite],
  );

  const validateAll = useCallback(() => {
    suite
      .afterEach(() => {
        // Create a new object reference to trigger a re-render
        setFormData(current => ({ ...current }));
      })
      .run(formData);
  }, [formData, suite]);

  return {
    formData,
    validate,
    validateAll,
    setFormData,
  };
}

// Usage
function MyForm() {
  const { formData, validate, validateAll } = useVestForm(suite);

  const handleSubmit = e => {
    e.preventDefault();
    validateAll();

    if (!suite.hasErrors()) {
      // Submit form
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Async Validation

Handle async validations like API calls:

```jsx
import { create, test, enforce } from 'vest';
import 'vest/email';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username is already taken', async () => {
    // This test will run asynchronously
    await enforce(data.username).isNotBlank();

    const response = await fetch(
      `/api/check-username?username=${data.username}`,
    );
    const { available } = await response.json();

    enforce(available).isTruthy();
  });
});

function UsernameField() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = value => {
    setIsChecking(true);

    suite
      .only('username')
      .afterEach(() => {
        setUsername(value);
        setIsChecking(false);
      })
      .run({ username: value });
  };

  return (
    <div>
      <input value={username} onChange={e => handleChange(e.target.value)} />
      {isChecking && <span>Checking availability...</span>}
      {suite.hasErrors('username') && <span>{suite.getError('username')}</span>}
    </div>
  );
}
```

## Best Practices

### 1. Create Suite Outside Component

Define your validation suite in a separate file or outside the component. Vest suites are stateful, so they should be treated as singletons for a given form.

```javascript
// validations/signupSuite.js
import { create, test, enforce } from 'vest';

export const suite = create(data => {
  // validations
});
```

```jsx
// components/SignupForm.jsx
import { suite } from '../validations/signupSuite';
import { useState } from 'react';

function SignupForm() {
  // ...
}
```

### 2. Field-Level Validation

Validate individual fields on change for better UX:

```jsx
const handleFieldChange = (fieldName, value) => {
  const nextState = { ...formData, [fieldName]: value };

  // Only validate the changed field
  suite
    .only(fieldName)
    .afterEach(() => setFormData(nextState))
    .run(nextState);
};
```

### 3. Form-Level Validation on Submit

Validate all fields before submission:

```jsx
const handleSubmit = e => {
  e.preventDefault();

  // Validate all fields
  suite
    .afterEach(() => {
      if (!suite.hasErrors()) {
        // Submit form
        submitForm(formData);
      }
    })
    .run(formData);
};
```

## TypeScript Support

Vest has [excellent TypeScript support](/docs/typescript_support):

```tsx
import { create, test, enforce } from 'vest';
import 'vest/email';

interface FormData {
  username: string;
  email: string;
  age: number;
}

const suite = create((data: Partial<FormData> = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('age', 'Must be 18 or older', () => {
    enforce(data.age).greaterThanOrEquals(18);
  });
});

function TypedForm() {
  const [formData, setFormData] = useState<Partial<FormData>>({});

  // Rest of component
}
```

## Next Steps

- Explore [Core Concepts](/docs/concepts) to understand Vest's architecture
- Learn about [The Test Function](/docs/writing_tests/the_test_function) for advanced validation patterns
- Check out [Async Tests](/docs/writing_tests/async_tests) for handling asynchronous validations

---
sidebar_position: 1
title: React
---

# Using Vest with React

Vest integrates seamlessly with React applications, providing powerful validation capabilities for forms and user input. This guide covers common patterns and best practices.

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
  const [result, setResult] = useState(suite.get());

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    suite
      .only(name)
      .afterEach(() => setResult(suite.get()))
      .run({ ...formData, [name]: value });
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
        {result.hasErrors('username') && (
          <span>{result.getError('username')}</span>
        )}
      </div>

      <div>
        <input
          name="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
        />
        {result.hasErrors('email') && <span>{result.getError('email')}</span>}
      </div>

      <button type="submit" disabled={!result.isValid()}>
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
  const [result, setResult] = useState(suite.get());

  const validate = useCallback(
    (fieldName, value) => {
      const newData = { ...formData, [fieldName]: value };
      setFormData(newData);

      suite
        .only(fieldName)
        .afterEach(() => {
          setResult(suite.get());
        })
        .run(newData);
    },
    [formData, suite],
  );

  const validateAll = useCallback(() => {
    suite
      .afterEach(() => {
        setResult(suite.get());
      })
      .run(formData);
  }, [formData, suite]);

  return {
    formData,
    result,
    validate,
    validateAll,
    setFormData,
  };
}

// Usage
function MyForm() {
  const { formData, result, validate, validateAll } = useVestForm(suite);

  const handleSubmit = e => {
    e.preventDefault();
    validateAll();

    if (!result.hasErrors()) {
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
  const [result, setResult] = useState(suite.get());
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = value => {
    setUsername(value);
    setIsChecking(true);

    suite
      .only('username')
      .afterEach(() => {
        setResult(suite.get());
        setIsChecking(false);
      })
      .run({ username: value });
  };

  return (
    <div>
      <input value={username} onChange={e => handleChange(e.target.value)} />
      {isChecking && <span>Checking availability...</span>}
      {result.hasErrors('username') && (
        <span>{result.getError('username')}</span>
      )}
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
  const [result, setResult] = useState(suite.get());

  // ...
}
```

### 2. Field-Level Validation

Validate individual fields on change for better UX:

```jsx
const handleFieldChange = (fieldName, value) => {
  setFormData(prev => ({ ...prev, [fieldName]: value }));

  // Only validate the changed field
  suite
    .only(fieldName)
    .afterEach(() => setResult(suite.get()))
    .run({ ...formData, [fieldName]: value });
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
      const result = suite.get();
      if (!result.hasErrors()) {
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
import { create, test, enforce, SuiteResult } from 'vest';
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
  const [result, setResult] = useState<SuiteResult>(suite.get());

  // Rest of component
}
```

## Next Steps

- Explore [Core Concepts](/docs/concepts) to understand Vest's architecture
- Learn about [The Test Function](/docs/writing_tests/the_test_function) for advanced validation patterns
- Check out [Async Tests](/docs/writing_tests/async_tests) for handling asynchronous validations

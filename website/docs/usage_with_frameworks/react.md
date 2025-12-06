---
sidebar_position: 1
title: React
---

# Using Vest with React

Vest integrates seamlessly with React applications, providing powerful validation capabilities for forms and user input. This guide covers common patterns and best practices.

## Quick Start

```jsx
import { create, test, enforce } from 'vest';
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
    suite.afterEach(setResult).run({ ...formData, [name]: value }, name);
  };

  return (
    <form>
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={e => handleChange('username', e.target.value)}
        />
        {result.hasErrors('username') && (
          <span>{result.getErrors('username')[0]}</span>
        )}
      </div>

      <div>
        <input
          name="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
        />
        {result.hasErrors('email') && (
          <span>{result.getErrors('email')[0]}</span>
        )}
      </div>

      <button type="submit" disabled={result.hasErrors()}>
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
        .afterEach(res => {
          setResult(res);
        })
        .run(newData, fieldName);
    },
    [formData, suite],
  );

  const validateAll = useCallback(() => {
    suite
      .afterEach(res => {
        setResult(res);
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

## React Hook Form Integration

Vest works excellently with [React Hook Form](https://react-hook-form.com/) through the official resolver:

```bash
npm install @hookform/resolvers
```

```jsx
import { useForm } from 'react-hook-form';
import { vestResolver } from '@hookform/resolvers/vest';
import { create, test, enforce } from 'vest';

const validationSuite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('password', 'Password must be at least 8 characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
});

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: vestResolver(validationSuite),
  });

  const onSubmit = data => {
    console.log('Valid data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

## Async Validation

Handle async validations like API calls:

```jsx
import { create, test, enforce } from 'vest';

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
      .afterEach(res => {
        setResult(res);
        setIsChecking(false);
      })
      .run({ username: value }, 'username');
  };

  return (
    <div>
      <input value={username} onChange={e => handleChange(e.target.value)} />
      {isChecking && <span>Checking availability...</span>}
      {result.hasErrors('username') && (
        <span>{result.getErrors('username')[0]}</span>
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
    .afterEach(setResult)
    .run({ ...formData, [fieldName]: value }, fieldName);
};
```

### 3. Form-Level Validation on Submit

Validate all fields before submission:

```jsx
const handleSubmit = e => {
  e.preventDefault();

  // Validate all fields
  suite
    .afterEach(result => {
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

---
sidebar_position: 4
title: Vanilla JavaScript
---

# Using Vest with Vanilla JavaScript

Vest works perfectly with plain JavaScript without any framework dependencies. This guide shows you how to use Vest for form validation in vanilla JS applications.

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vest Validation Example</title>
  </head>
  <body>
    <form id="signup-form">
      <div>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
        />
        <span id="username-error" class="error"></span>
      </div>

      <div>
        <input type="email" id="email" name="email" placeholder="Email" />
        <span id="email-error" class="error"></span>
      </div>

      <button type="submit">Sign Up</button>
    </form>

    <script type="module">
      import {
        create,
        test,
        enforce,
      } from 'https://cdn.jsdelivr.net/npm/vest@latest/dist/vest.mjs';

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

      const form = document.getElementById('signup-form');
      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');

      let formData = {
        username: '',
        email: '',
      };

      function validateField(fieldName) {
        const result = suite
          .afterEach(() => {
            updateErrorDisplay(fieldName, suite.get());
          })
          .run(formData, fieldName);
      }

      function updateErrorDisplay(fieldName, result) {
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (result.hasErrors(fieldName)) {
          errorElement.textContent = result.getErrors(fieldName)[0];
          errorElement.style.display = 'block';
        } else {
          errorElement.textContent = '';
          errorElement.style.display = 'none';
        }
      }

      usernameInput.addEventListener('input', e => {
        formData.username = e.target.value;
        validateField('username');
      });

      emailInput.addEventListener('input', e => {
        formData.email = e.target.value;
        validateField('email');
      });

      form.addEventListener('submit', e => {
        e.preventDefault();

        suite
          .afterEach(() => {
            const res = suite.get();
            if (!res.hasErrors()) {
              console.log('Form is valid!', formData);
              // Submit form
            } else {
              // Update all error displays
              Object.keys(formData).forEach(field => {
                updateErrorDisplay(field, res);
              });
            }
          })
          .run(formData);
      });
    </script>

    <style>
      .error {
        color: red;
        font-size: 0.875rem;
        display: none;
      }

      input.invalid {
        border-color: red;
      }

      input.valid {
        border-color: green;
      }
    </style>
  </body>
</html>
```

## Using with NPM/Bundlers

```bash
npm install vest
```

```js
// validation.js
import { create, test, enforce } from 'vest';

export const signupSuite = create((data = {}) => {
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

  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('password', 'Password must be at least 8 characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
});
```

```js
// main.js
import { signupSuite } from './validation.js';

class FormValidator {
  constructor(formElement, suite) {
    this.form = formElement;
    this.suite = suite;
    this.formData = {};
    this.touched = {};

    this.init();
  }

  init() {
    // Get all form inputs
    const inputs = this.form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const fieldName = input.name;
      this.formData[fieldName] = input.value;
      this.touched[fieldName] = false;

      // Validate on input
      input.addEventListener('input', e => {
        this.formData[fieldName] = e.target.value;
        this.validateField(fieldName);
      });

      // Mark as touched on blur
      input.addEventListener('blur', () => {
        this.touched[fieldName] = true;
        this.validateField(fieldName);
      });
    });

    // Validate on submit
    this.form.addEventListener('submit', e => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  validateField(fieldName) {
    this.suite
      .afterEach(() => {
        this.updateFieldUI(fieldName, this.suite.get());
      })
      .run(this.formData, fieldName);
  }

  validateAll() {
    return new Promise(resolve => {
      this.suite
        .afterEach(() => {
          const result = this.suite.get();
          // Update UI for all fields
          Object.keys(this.formData).forEach(fieldName => {
            this.touched[fieldName] = true;
            this.updateFieldUI(fieldName, result);
          });

          resolve(result);
        })
        .run(this.formData);
    });
  }

  updateFieldUI(fieldName, result) {
    const input = this.form.querySelector(`[name="${fieldName}"]`);
    const errorContainer = this.form.querySelector(
      `[data-error="${fieldName}"]`,
    );

    if (!input) return;

    // Only show errors for touched fields
    if (this.touched[fieldName] && result.hasErrors(fieldName)) {
      input.classList.add('invalid');
      input.classList.remove('valid');

      if (errorContainer) {
        errorContainer.textContent = result.getErrors(fieldName)[0];
        errorContainer.style.display = 'block';
      }
    } else if (this.touched[fieldName] && result.isValid(fieldName)) {
      input.classList.add('valid');
      input.classList.remove('invalid');

      if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
      }
    } else {
      input.classList.remove('valid', 'invalid');

      if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
      }
    }
  }

  async handleSubmit() {
    const result = await this.validateAll();

    if (!result.hasErrors()) {
      console.log('Form is valid!', this.formData);
      // Submit form data
      this.submitForm();
    }
  }

  submitForm() {
    // Your form submission logic
    fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.formData),
    })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
  }
}

// Initialize
const form = document.getElementById('signup-form');
new FormValidator(form, signupSuite);
```

HTML:

```html
<form id="signup-form">
  <div>
    <input type="text" name="username" placeholder="Username" />
    <span data-error="username" class="error"></span>
  </div>

  <div>
    <input type="email" name="email" placeholder="Email" />
    <span data-error="email" class="error"></span>
  </div>

  <div>
    <input type="password" name="password" placeholder="Password" />
    <span data-error="password" class="error"></span>
  </div>

  <button type="submit">Sign Up</button>
</form>
```

## Async Validation

Handle async validations like API calls:

```js
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

// Usage with loading state
const usernameInput = document.getElementById('username');
const loadingIndicator = document.getElementById('username-loading');

let debounceTimer;

usernameInput.addEventListener('input', e => {
  const username = e.target.value;

  clearTimeout(debounceTimer);

  if (username) {
    loadingIndicator.style.display = 'inline';

    debounceTimer = setTimeout(() => {
      suite
        .afterEach(() => {
          const result = suite.get();
          loadingIndicator.style.display = 'none';
          updateErrorDisplay('username', result);
        })
        .run({ username }, 'username');
    }, 500);
  }
});
```

## Debounce Helper

Create a debounce utility for better UX:

```js
function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedValidate = debounce((fieldName, value) => {
  formData[fieldName] = value;
  validateField(fieldName);
}, 300);

usernameInput.addEventListener('input', e => {
  debouncedValidate('username', e.target.value);
});
```

## Real-time Validation Feedback

Show validation status as the user types:

```js
function updateFieldStatus(fieldName, result) {
  const input = document.querySelector(`[name="${fieldName}"]`);
  const statusIcon = document.querySelector(`[data-status="${fieldName}"]`);

  if (result.isPending(fieldName)) {
    statusIcon.textContent = '⏳';
    statusIcon.title = 'Validating...';
  } else if (result.hasErrors(fieldName)) {
    statusIcon.textContent = '❌';
    statusIcon.title = result.getErrors(fieldName)[0];
  } else if (result.isValid(fieldName)) {
    statusIcon.textContent = '✅';
    statusIcon.title = 'Valid';
  } else {
    statusIcon.textContent = '';
  }
}
```

## Best Practices

### 1. Separate Validation Logic

Keep validation suites in separate files. Vest suites are stateful, so they should be treated as singletons for a given form.

```js
// validations/signup.js
export const signupSuite = create((data = {}) => {
  // validation tests
});

// validations/login.js
export const loginSuite = create((data = {}) => {
  // validation tests
});
```

### 2. Show Errors After Touch

Only display errors after a user has interacted with a field:

```js
const touched = {};

input.addEventListener('blur', () => {
  touched[fieldName] = true;
});

function shouldShowError(fieldName, result) {
  return touched[fieldName] && result.hasErrors(fieldName);
}
```

### 3. Provide Visual Feedback

Use CSS classes to indicate validation state:

```css
input.valid {
  border-color: #22c55e;
  background-image: url('data:image/svg+xml,...'); /* checkmark */
}

input.invalid {
  border-color: #ef4444;
  background-image: url('data:image/svg+xml,...'); /* x mark */
}

input.validating {
  border-color: #3b82f6;
  /* Add spinner animation */
}
```

## Next Steps

- Learn about [Core Concepts](/docs/concepts) to understand Vest's architecture
- Explore [Async Tests](/docs/writing_tests/async_tests) for handling asynchronous validations
- Check out [Skip and Only](/docs/writing_your_suite/including_and_excluding/skip_and_only) for complex validation scenarios

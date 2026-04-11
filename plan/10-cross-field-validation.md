# Plan: Cross-Field Validation DX

> Priority: **Should** | Impact: **Medium** | Effort: **Low**

---

## Rationale

Cross-field validation — "confirm password must match password" — is the most common multi-field pattern in form validation. In Vest, expressing this correctly requires understanding `include().when()`:

```typescript
// Current approach — verbose and indirect
include('confirmPassword').when('password');

test('confirmPassword', 'Passwords must match', () => {
  enforce(data.confirmPassword).equals(data.password);
});
```

The user must know that `include` exists, understand that focused runs skip non-focused fields, and wire up the dependency manually. This is the #1 question in support channels.

A simpler API would reduce boilerplate and make the intent clearer.

---

## Implementation Feasibility

**Complexity:** Low. This is primarily syntactic sugar over existing primitives (`include().when()`). The test function already returns a chainable object in some contexts.

**Key decisions:**
1. Method on the test return value vs standalone utility?
2. Should it auto-generate the `include().when()` call?
3. Should it handle the validation logic too, or just the wiring?

**Dependencies:**
- `include().when()` — the underlying mechanism
- `test()` return value — currently returns `void` inside the suite callback
- `suite.focus()` / `suite.only()` — the reason cross-field wiring is needed

---

## API Proposals

### Proposal A: `test().dependsOn(field)` (Wiring Only)

Adds a chainable method to `test()` that auto-generates the `include().when()` call.

```typescript
const suite = create((data) => {
  test('password', 'Password required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('confirmPassword', 'Passwords must match', () => {
    enforce(data.confirmPassword).equals(data.password);
  }).dependsOn('password');
  // Equivalent to: include('confirmPassword').when('password')
  // When 'password' is focused, 'confirmPassword' is auto-included

  // Multiple dependencies
  test('total', 'Sum must be 100', () => {
    enforce(data.a + data.b + data.c).equals(100);
  }).dependsOn('a', 'b', 'c');
});
```

**Pros:** Minimal API addition, intent is clear, co-located with the test.
**Cons:** Overlaps with async `dependsOn` from Plan #09 — need to distinguish.

### Proposal B: `link(sourceField, targetField)` Standalone Utility

A top-level function that explicitly links fields.

```typescript
import { create, test, enforce, link } from 'vest';

const suite = create((data) => {
  // Declare links up front
  link('password', 'confirmPassword');
  link('startDate', 'endDate');

  test('password', 'Required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('confirmPassword', 'Must match', () => {
    enforce(data.confirmPassword).equals(data.password);
  });

  test('startDate', 'Required', () => {
    enforce(data.startDate).isNotEmpty();
  });

  test('endDate', 'Must be after start', () => {
    enforce(new Date(data.endDate)).isAfter(data.startDate);
  });
});

// When validating 'password', 'confirmPassword' is auto-included
suite.only('password').run(data);
```

**Pros:** Clear intent, separate from test definition, bidirectional linking possible.
**Cons:** Adds a new top-level API, link declarations are separated from tests.

### Proposal C: `test.cross(fields, name, message, callback)`

A dedicated function for cross-field tests that auto-wires inclusion for all named fields.

```typescript
import { create, test, enforce } from 'vest';

const suite = create((data) => {
  test('password', 'Required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('confirmPassword', 'Required', () => {
    enforce(data.confirmPassword).isNotEmpty();
  });

  // Cross-field test: auto-included when ANY of the listed fields is focused
  test.cross(
    ['password', 'confirmPassword'],
    'confirmPassword',
    'Passwords must match',
    () => {
      enforce(data.confirmPassword).equals(data.password);
    }
  );

  test.cross(
    ['startDate', 'endDate'],
    'endDate',
    'End date must be after start',
    () => {
      enforce(new Date(data.endDate)).isAfter(data.startDate);
    }
  );
});
```

**Pros:** Explicit about which fields are involved, auto-includes for all directions.
**Cons:** New API surface, the first array argument feels like boilerplate.

---

## Testing Strategy

### Unit Tests

```typescript
describe('cross-field validation', () => {
  describe('Proposal A: test().dependsOn()', () => {
    it('auto-includes dependent field during focused run', () => {
      const suite = create((data) => {
        test('password', 'Required', () => {
          enforce(data.password).isNotEmpty();
        });
        test('confirmPassword', 'Must match', () => {
          enforce(data.confirmPassword).equals(data.password);
        }).dependsOn('password');
      });

      const result = suite.only('password').run({
        password: 'abc123',
        confirmPassword: 'different',
      });

      // confirmPassword should be validated even though only 'password' was focused
      expect(result.hasErrors('confirmPassword')).toBe(true);
      expect(result.getErrors('confirmPassword')).toContain('Must match');
    });

    it('does not include dependent field when source is not focused', () => {
      const suite = create((data) => {
        test('email', 'Required', () => {
          enforce(data.email).isNotEmpty();
        });
        test('confirmPassword', 'Must match', () => {
          enforce(data.confirmPassword).equals(data.password);
        }).dependsOn('password');
      });

      const result = suite.only('email').run({
        email: 'test@test.com',
        password: 'abc',
        confirmPassword: 'different',
      });

      // confirmPassword should NOT be validated when email is focused
      expect(result.hasErrors('confirmPassword')).toBe(false);
    });

    it('works with multiple dependencies', () => {
      const suite = create((data) => {
        test('a', () => enforce(data.a).isNotEmpty());
        test('b', () => enforce(data.b).isNotEmpty());

        test('total', 'Sum must equal 100', () => {
          enforce(Number(data.a) + Number(data.b)).equals(100);
        }).dependsOn('a', 'b');
      });

      // Focus on 'a' — 'total' should be included
      const result = suite.only('a').run({ a: '30', b: '70' });
      expect(result.isTested('total')).toBe(true);
    });

    it('works alongside manual include().when()', () => {
      const suite = create((data) => {
        include('related').when('source');

        test('source', () => enforce(data.source).isNotEmpty());
        test('related', () => enforce(data.related).isNotEmpty());
        test('dependent', () => {
          enforce(data.dependent).equals(data.source);
        }).dependsOn('source');
      });

      const result = suite.only('source').run({
        source: 'val', related: '', dependent: 'val'
      });

      expect(result.isTested('related')).toBe(true);
      expect(result.isTested('dependent')).toBe(true);
    });
  });
});
```

### Integration Tests

```typescript
describe('cross-field: real-world patterns', () => {
  it('confirm password pattern', () => {
    const suite = create((data) => {
      test('password', 'Too short', () => {
        enforce(data.password).longerThan(7);
      });

      test('confirmPassword', 'Must match password', () => {
        enforce(data.confirmPassword).equals(data.password);
      }).dependsOn('password');
    });

    // User types password
    const r1 = suite.only('password').run({
      password: 'longpassword',
      confirmPassword: '',
    });
    expect(r1.hasErrors('password')).toBe(false);
    expect(r1.hasErrors('confirmPassword')).toBe(true); // auto-included

    // User types matching confirm
    const r2 = suite.only('confirmPassword').run({
      password: 'longpassword',
      confirmPassword: 'longpassword',
    });
    expect(r2.isValid('confirmPassword')).toBe(true);
  });

  it('date range pattern', () => {
    const suite = create((data) => {
      test('startDate', 'Required', () => {
        enforce(data.startDate).isNotEmpty();
      });
      test('endDate', 'Required', () => {
        enforce(data.endDate).isNotEmpty();
      });
      test('endDate', 'Must be after start date', () => {
        enforce(new Date(data.endDate) > new Date(data.startDate)).isTruthy();
      }).dependsOn('startDate');
    });

    const result = suite.only('startDate').run({
      startDate: '2026-01-01',
      endDate: '2025-06-01',
    });

    expect(result.hasErrors('endDate')).toBe(true);
  });
});
```

---

## Documentation

### Page: `docs/writing_tests/advanced_test_features/cross_field_validation.md`

```markdown
# Cross-Field Validation

## The Problem
When using `suite.only('password')`, the confirmPassword test is skipped.
But confirmPassword depends on password — it should re-validate too.

## Solution: dependsOn
test('confirmPassword', 'Passwords must match', () => {
  enforce(data.confirmPassword).equals(data.password);
}).dependsOn('password');

When 'password' is focused via `suite.only('password')`,
'confirmPassword' is automatically included.

## Multiple Dependencies
test('total', 'Must equal 100', () => {
  enforce(data.a + data.b + data.c).numberEquals(100);
}).dependsOn('a', 'b', 'c');

// Runs when ANY of a, b, or c is focused

## vs include().when()
`dependsOn` is shorthand for `include('field').when('otherField')`.
Use `dependsOn` for simple field-to-field linking.
Use `include().when()` for complex conditional logic.
```

---

## Open Questions

1. Should `dependsOn` be the same API for both cross-field inclusion (this plan) and async gating (Plan #09)? (Lean: same name, different behavior based on context — inclusion for sync, gating for async)
2. Should linking be bidirectional? (When `confirmPassword.dependsOn('password')`, should focusing `confirmPassword` also include `password`?)
3. Should `dependsOn` work with groups? (e.g., `dependsOn.group('billing')`)

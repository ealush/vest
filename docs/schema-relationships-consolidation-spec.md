# Schema Relationships Consolidation Specification

## Scope

This specification covers implementation introduced or materially changed by
PR #1326. It does not authorize a repository-wide style rewrite or a redesign
of the selective execution engine.

## Goals

- Reuse existing `vest-utils` predicates and normalizers when their semantics
  exactly match local code.
- Promote repeated, package-neutral operations to `vest-utils`.
- Keep schema relationship, schema path, projection, and retained-data rules
  inside their owning packages.
- Preserve runtime behavior, public feature behavior, and performance.

## Shared utilities

PR production code should use the existing `isArray`, `isFunction`,
`isStringValue`, `isNullish`, `asArray`, and `hasOwnProperty` utilities instead
of equivalent inline checks.

Two repeated package-neutral operations are shared through `vest-utils`:

- `isRecord(value)` recognizes a non-null object excluding arrays. It does not
  claim that the object has a plain-object prototype.
- `isArrayPrefix(prefix, value, equals?)` recognizes a positional array prefix
  and permits a domain-specific equality comparator.

## Ownership boundaries

- Generic value and collection operations belong to `vest-utils`.
- `SchemaPath` segment equality and wildcard/item semantics belong to n4s.
- Concrete mapped-data paths and retained-value mutation belong to Vest.
- Parsing affected field names, unsafe-key protection, schema projection, and
  dependency graph traversal remain feature-specific.

An operation must not move to `vest-utils` merely because two functions have
similar names. Their equality, mutation, error, and security contracts must be
identical.

## Compatibility

The consolidation must not change validation selection, dependency expansion,
failure retention, parser mapping, callback data, error text, or execution
order. New `vest-utils` exports are additive.

## Verification

- Unit-test every new utility, including boundary values and custom equality.
- Run affected n4s, Vest, and vest-utils tests.
- Run schema boundary, coverage, type, and performance gates.
- Review the final diff for accidental changes outside PR #1326's production
  implementation and its tests/specification.

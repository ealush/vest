import { test } from 'vitest';
import { create } from '../../vest';
import { enforce } from 'n4s';

test('suiteResultTypes', () => {
  const schema = enforce.shape({
    username: enforce.isString(),
  });

  const suite = create(_data => {
    // ...
  }, schema);

  const result = suite.get();

  // This should pass type checking
  const types = result.types;

  if (types) {
    // types should be defined when schema is provided
    void types;
  }

  create(() => {
    // ...
  });

  // This should be undefined
});

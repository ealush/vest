import { test } from 'vitest';
import { create } from '../../vest';
import { enforce } from 'n4s';

test('suiteResultTypes', () => {
  const schema = enforce.shape({
    username: enforce.isString(),
  });

  const suite = create(data => {
    // ...
  }, schema);

  const result = suite.get();

  // This should pass type checking
  const types = result.types;

  if (types) {
    const data = types;
  }

  const suiteNoSchema = create(() => {
    // ...
  });

  // This should be undefined
});

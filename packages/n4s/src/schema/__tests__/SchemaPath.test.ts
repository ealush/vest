import { describe, expect, it } from 'vitest';

import {
  isSchemaPathPrefixedBy,
  itemSegment,
  propertySegment,
  schemaPathsEqual,
} from '../SchemaPath';

describe('schemaPathsEqual', () => {
  it('compares property keys and item bindings', () => {
    expect(
      schemaPathsEqual(
        [propertySegment('rows'), itemSegment('row')],
        [propertySegment('rows'), itemSegment('row')],
      ),
    ).toBe(true);
    expect(
      schemaPathsEqual(
        [propertySegment('rows'), itemSegment('row')],
        [propertySegment('rows'), itemSegment('other')],
      ),
    ).toBe(false);
  });
});

describe('isSchemaPathPrefixedBy', () => {
  it('compares property identity while treating item bindings as traversal markers', () => {
    expect(
      isSchemaPathPrefixedBy(
        [
          propertySegment('rows'),
          itemSegment('concrete'),
          propertySegment('country'),
        ],
        [propertySegment('rows'), itemSegment('scope')],
      ),
    ).toBe(true);
    expect(
      isSchemaPathPrefixedBy(
        [propertySegment('other'), itemSegment('concrete')],
        [propertySegment('rows'), itemSegment('scope')],
      ),
    ).toBe(false);
  });
});

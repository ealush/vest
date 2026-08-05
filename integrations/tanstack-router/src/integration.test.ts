import { describe, expect, it } from 'vitest';

import { loadSearch } from './router';

describe('Vest with TanStack Router', () => {
  it('validates and transforms route search parameters', async () => {
    await expect(loadSearch('/?page=2&query=%20vest%20')).resolves.toEqual({
      page: 2,
      query: 'vest',
    });
  });

  it('rejects invalid search parameters during route loading', async () => {
    await expect(loadSearch('/?page=0&query=vest')).rejects.toThrow(
      'Validation failed',
    );
  });
});

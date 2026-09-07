import { describe, expect, it } from 'vitest';

import { enforce } from '../../n4s';
import { mapWithoutValidation } from '../mapWithoutValidation';

describe('mapWithoutValidation', () => {
  it('returns the declared parser output even when parser validation fails', () => {
    const mapped = mapWithoutValidation(
      enforce.isNumeric().toNumber(),
      'not-numeric',
    );

    expect(typeof mapped).toBe('number');
    if (typeof mapped !== 'number') {
      throw new TypeError('Expected the parser output type');
    }
    expect(Number.isNaN(mapped)).toBe(true);
  });
});

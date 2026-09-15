import { describe, expect, it, vi } from 'vitest';

import { compose } from '../../compose';
import { enforce } from '../../n4s';
import {
  MappingProvenance,
  mapWithoutValidation,
} from '../mapWithoutValidation';

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

  it('maps a parser wrapped in optional while preserving nullish values', () => {
    const optionalNumber = enforce.optional(enforce.isNumeric().toNumber());

    expect(mapWithoutValidation(optionalNumber, '42')).toBe(42);
    expect(mapWithoutValidation(optionalNumber, undefined)).toBeUndefined();
    expect(mapWithoutValidation(optionalNumber, null)).toBeNull();
  });

  it('maps every stage of a nested parser chain and records its provenance', () => {
    const nested = enforce.isNumeric().toNumber().clamp(0, 120);
    const provenance: MappingProvenance = { mapped: [], unions: [] };

    expect(mapWithoutValidation(nested, '200', provenance)).toBe(120);
    expect(mapWithoutValidation(nested, '90', provenance)).toBe(90);
    // Both parser stages executed at the base path (one mark per stage).
    expect(provenance.mapped).toEqual([[], []]);
    expect(provenance.unions).toEqual([]);
  });

  it('maps nested parsers under shape and array paths with absolute provenance', () => {
    const schema = enforce.shape({
      deep: enforce.isNumeric().toNumber().clamp(0, 120),
      rows: enforce.isArrayOf(enforce.isNumeric().toNumber()),
    });
    const provenance: MappingProvenance = { mapped: [], unions: [] };

    expect(
      mapWithoutValidation(
        schema,
        { deep: '200', rows: ['1', '2'] },
        provenance,
      ),
    ).toEqual({ deep: 120, rows: [1, 2] });
    expect(provenance.mapped).toContainEqual(['deep']);
    expect(provenance.mapped).toContainEqual(['rows', 0]);
    expect(provenance.mapped).toContainEqual(['rows', 1]);
    expect(provenance.unions).toEqual([]);
  });

  it('maps nested parsers without executing validation predicates', () => {
    const predicate = vi.fn(() => true);
    const nested = compose(
      enforce.isNumeric().toNumber().clamp(0, 120),
      enforce.condition(predicate),
    );

    expect(mapWithoutValidation(nested, '200')).toBe(120);
    expect(predicate).not.toHaveBeenCalled();
  });
});

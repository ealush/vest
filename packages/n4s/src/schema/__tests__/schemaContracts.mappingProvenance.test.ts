import { describe, expect, it, vi } from 'vitest';

import { compose } from '../../compose';
import { enforce } from '../../n4s';
import {
  MappingProvenance,
  mapWithoutValidation,
} from '../mapWithoutValidation';

describe('schema contracts: composition mapping provenance', () => {
  it.each(['direct', 'nested', 'optional'] as const)(
    'preserves absolute parser and unresolved union paths through %s composition',
    placement => {
      const predicate = vi.fn(() => true);
      const inner = enforce.shape({
        rows: enforce.isArrayOf(
          compose(enforce.condition(predicate), enforce.isNumeric().toNumber()),
          enforce.isBoolean(),
        ),
        count: enforce.isNumeric().toNumber(),
      });
      const composed = compose(inner);
      const rule =
        placement === 'direct'
          ? composed
          : placement === 'nested'
            ? compose(composed)
            : enforce.optional(composed);
      const schema = enforce.shape({ box: rule });
      const provenance: MappingProvenance = { mapped: [], unions: [] };

      expect(
        mapWithoutValidation(
          schema,
          { box: { rows: ['2'], count: '3' } },
          provenance,
        ),
      ).toEqual({ box: { rows: ['2'], count: 3 } });
      expect(provenance.unions).toEqual([['box', 'rows']]);
      expect(provenance.mapped).toContainEqual(['box', 'count']);
      expect(provenance.mapped).not.toContainEqual(['box', 'rows', 0]);
      expect(predicate).not.toHaveBeenCalled();
    },
  );
});

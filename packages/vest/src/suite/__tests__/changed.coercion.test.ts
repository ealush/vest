import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create } from '../../vest';

const coercingSchema = enforce.shape({
  rows: enforce.isArrayOf(enforce.isNumeric().toNumber()),
});

type CoercingData = {
  rows: string[];
};

describe('changed() coercion parity for excluded array members', () => {
  it('passing run: changed() parsed data equals the full-run coerced values', async () => {
    let fullInput: unknown;
    let changedInput: unknown;
    const fullSuite = create(data => {
      fullInput = data;
    }, coercingSchema);
    const changedSuite = create(data => {
      changedInput = data;
    }, coercingSchema);

    const data: CoercingData = { rows: ['42'] };
    const full = await fullSuite.run(data);
    const changed = await changedSuite.changed('rows.0').run(data);

    expect(full.run.data.parsed).toEqual({ rows: [42] });
    expect(changed.run.data.parsed).toEqual(full.run.data.parsed);
    expect(changed.run.data.parsed).toEqual({ rows: [42] });
    expect(changedInput).toEqual({ rows: [42] });
    expect(changedInput).toEqual(fullInput);
  });

  it('passing run: every affected index keeps its coercion', async () => {
    const suite = create(() => {}, coercingSchema);

    const data: CoercingData = { rows: ['1', '2'] };
    const full = await suite.run(data);
    const changed = await suite.changed(['rows.0', 'rows.1']).run(data);

    expect(full.run.data.parsed).toEqual({ rows: [1, 2] });
    expect(changed.run.data.parsed).toEqual(full.run.data.parsed);
  });

  it('failing run: raw-input fallback parity is preserved', async () => {
    let fullInput: unknown;
    let changedInput: unknown;
    const fullSuite = create(data => {
      fullInput = data;
    }, coercingSchema);
    const changedSuite = create(data => {
      changedInput = data;
    }, coercingSchema);

    const data: CoercingData = { rows: ['nope'] };
    const full = await fullSuite.run(data);
    const changed = await changedSuite.changed('rows.0').run(data);

    expect(full.isValid()).toBe(false);
    expect(changed.isValid()).toBe(false);
    expect(changed.run.data.parsed).toEqual(full.run.data.parsed);
    expect(changedInput).toEqual(data);
    expect(changedInput).toEqual(fullInput);
  });
});

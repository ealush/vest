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

  it('preserves the full mapped schema output for the suite callback', async () => {
    const schema = enforce.shape({
      profile: enforce.shape({ state: enforce.isString() }),
      age: enforce.isNumeric().toNumber(),
    });

    let callbackInput: unknown;
    const suite = create(data => {
      callbackInput = data;
    }, schema);

    const input = { profile: { state: 'CA' }, age: '42' };
    const full = await suite.run(input);
    const changed = await suite.changed('profile.state').run(input);

    expect(full.run.data.parsed).toEqual({
      profile: { state: 'CA' },
      age: 42,
    });

    // Parsed metadata is intentionally per-run in Vest 6: this changed run
    // mapped profile.state and did not claim that it remapped age.
    expect(changed.run.data.parsed).toEqual({
      profile: { state: 'CA' },
      age: '42',
    });

    // The suite callback has a different contract: its parameter is typed as
    // the schema's full output, so untouched successful transformations are
    // retained from the previous mapped snapshot.
    expect(callbackInput).toEqual(full.run.data.parsed);
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

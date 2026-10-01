import { describe, expect, it } from 'vitest';

import * as vest from '../../../vest';

describe('key: retained verdicts after a reorder', () => {
  const createRowsSuite = () =>
    vest.create((data: { rows: { id: string; value: string }[] }) => {
      vest.each(data.rows, (row, index) => {
        vest.test(
          `rows.${index}.value`,
          'required',
          () => {
            vest.enforce(row.value).isNotBlank();
          },
          row.id,
        );
      });
      vest.test('other', () => {});
    });

  it('reports a focused-out verdict under its current field name', () => {
    const suite = createRowsSuite();
    suite.run({
      rows: [
        { id: 'a', value: '' },
        { id: 'b', value: 'ok' },
      ],
    });
    expect(suite.get().getErrors()).toEqual({ 'rows.0.value': ['required'] });

    // Row "a" moves to index 1 while focus excludes it: its retained
    // failure follows the row, not the index it used to have.
    const result = suite.only('other').run({
      rows: [
        { id: 'b', value: 'ok' },
        { id: 'a', value: '' },
      ],
    });
    expect(result.getErrors()).toEqual({ 'rows.1.value': ['required'] });
    expect(result.hasErrors('rows.0.value')).toBe(false);
    expect(result.isTested('rows.0.value')).toBe(true);
  });

  it('keeps the same verdict when the row is validated again', () => {
    const suite = createRowsSuite();
    suite.run({
      rows: [
        { id: 'a', value: '' },
        { id: 'b', value: 'ok' },
      ],
    });
    suite.only('other').run({
      rows: [
        { id: 'b', value: 'ok' },
        { id: 'a', value: '' },
      ],
    });
    const result = suite.run({
      rows: [
        { id: 'b', value: 'ok' },
        { id: 'a', value: '' },
      ],
    });
    expect(result.getErrors()).toEqual({ 'rows.1.value': ['required'] });
  });
});

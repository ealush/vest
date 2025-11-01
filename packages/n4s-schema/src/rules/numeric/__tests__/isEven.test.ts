import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isEven (numeric)', () => {
  it('passes for even numeric strings', () => {
    expect(enforceLazy.isNumeric().isEven().run('0').passes).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run('2').passes).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run('42').passes).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run('-2').passes).toBe(true);
  });

  it('passes for even numbers', () => {
    expect(enforceLazy.isNumeric().isEven().run(2).passes).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run(42).passes).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run(0).passes).toBe(true);
  });

  it('fails for odd values', () => {
    expect(enforceLazy.isNumeric().isEven().run('1').passes).toBe(false);
    expect(enforceLazy.isNumeric().isEven().run('3').passes).toBe(false);
    expect(enforceLazy.isNumeric().isEven().run(1).passes).toBe(false);
  });
});

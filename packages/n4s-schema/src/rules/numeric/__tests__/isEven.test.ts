import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isEven (numeric)', () => {
  it('pass for even numeric strings', () => {
    expect(enforceLazy.isNumeric().isEven().run('0').pass).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run('2').pass).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run('42').pass).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run('-2').pass).toBe(true);
  });

  it('pass for even numbers', () => {
    expect(enforceLazy.isNumeric().isEven().run(2).pass).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run(42).pass).toBe(true);
    expect(enforceLazy.isNumeric().isEven().run(0).pass).toBe(true);
  });

  it('fails for odd values', () => {
    expect(enforceLazy.isNumeric().isEven().run('1').pass).toBe(false);
    expect(enforceLazy.isNumeric().isEven().run('3').pass).toBe(false);
    expect(enforceLazy.isNumeric().isEven().run(1).pass).toBe(false);
  });
});

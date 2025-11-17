import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isEven (numeric)', () => {
  it('pass for even numeric strings', () => {
    expect(enforce.isNumeric().isEven().run('0').pass).toBe(true);
    expect(enforce.isNumeric().isEven().run('2').pass).toBe(true);
    expect(enforce.isNumeric().isEven().run('42').pass).toBe(true);
    expect(enforce.isNumeric().isEven().run('-2').pass).toBe(true);
  });

  it('pass for even numbers', () => {
    expect(enforce.isNumeric().isEven().run(2).pass).toBe(true);
    expect(enforce.isNumeric().isEven().run(42).pass).toBe(true);
    expect(enforce.isNumeric().isEven().run(0).pass).toBe(true);
  });

  it('fails for odd values', () => {
    expect(enforce.isNumeric().isEven().run('1').pass).toBe(false);
    expect(enforce.isNumeric().isEven().run('3').pass).toBe(false);
    expect(enforce.isNumeric().isEven().run(1).pass).toBe(false);
  });
});

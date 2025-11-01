import { describe, it, expect } from 'vitest';

import { isNumeric } from '../isNumeric';

describe('isEven (numeric)', () => {
  it('passes for even numeric strings', () => {
    expect(isNumeric().isEven().run('0').passes).toBe(true);
    expect(isNumeric().isEven().run('2').passes).toBe(true);
    expect(isNumeric().isEven().run('42').passes).toBe(true);
    expect(isNumeric().isEven().run('-2').passes).toBe(true);
  });

  it('passes for even numbers', () => {
    expect(isNumeric().isEven().run(2).passes).toBe(true);
    expect(isNumeric().isEven().run(42).passes).toBe(true);
    expect(isNumeric().isEven().run(0).passes).toBe(true);
  });

  it('fails for odd values', () => {
    expect(isNumeric().isEven().run('1').passes).toBe(false);
    expect(isNumeric().isEven().run('3').passes).toBe(false);
    expect(isNumeric().isEven().run(1).passes).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';

import { isNumber } from '../isNumber';

describe('lessThanOrEquals', () => {
  it('passes when number is less or equal', () => {
    expect(isNumber().lessThanOrEquals(5).run(4).passes).toBe(true);
    expect(isNumber().lessThanOrEquals(5).run(5).passes).toBe(true);
    expect(isNumber().lessThanOrEquals(1).run(1).passes).toBe(true);
    expect(isNumber().lessThanOrEquals(10).run(5).passes).toBe(true);
  });

  it('fails when number is greater', () => {
    expect(isNumber().lessThanOrEquals(5).run(6).passes).toBe(false);
    expect(isNumber().lessThanOrEquals(0).run(1).passes).toBe(false);
    expect(isNumber().lessThanOrEquals(5).run(10).passes).toBe(false);
  });
});

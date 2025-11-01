import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('lessThanOrEquals', () => {
  it('passes when number is less or equal', () => {
    expect(enforceLazy.isNumber().lessThanOrEquals(5).run(4).passes).toBe(true);
    expect(enforceLazy.isNumber().lessThanOrEquals(5).run(5).passes).toBe(true);
    expect(enforceLazy.isNumber().lessThanOrEquals(1).run(1).passes).toBe(true);
    expect(enforceLazy.isNumber().lessThanOrEquals(10).run(5).passes).toBe(true);
  });

  it('fails when number is greater', () => {
    expect(enforceLazy.isNumber().lessThanOrEquals(5).run(6).passes).toBe(false);
    expect(enforceLazy.isNumber().lessThanOrEquals(0).run(1).passes).toBe(false);
    expect(enforceLazy.isNumber().lessThanOrEquals(5).run(10).passes).toBe(false);
  });
});

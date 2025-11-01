import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('greaterThanOrEquals', () => {
  it('passes when number is greater or equal', () => {
    expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(1).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(5).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(10).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(0).passes).toBe(
      true,
    );
  });

  it('fails when number is less', () => {
    expect(enforceLazy.isNumber().greaterThanOrEquals(5).run(4).passes).toBe(
      false,
    );
    expect(enforceLazy.isNumber().greaterThanOrEquals(0).run(-1).passes).toBe(
      false,
    );
    expect(enforceLazy.isNumber().greaterThanOrEquals(10).run(5).passes).toBe(
      false,
    );
  });
});

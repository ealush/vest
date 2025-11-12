import { describe, it, expect } from 'vitest';

import partition from '../partition';

describe('partition', () => {
  it('should correctly partition an array', () => {
    expect(partition([300, 200, 10, 50, 0, -500], v => v <= 100))
      .toMatchInlineSnapshot(`
      [
        [
          10,
          50,
          0,
          -500,
        ],
        [
          300,
          200,
        ],
      ]
    `);
  });
});

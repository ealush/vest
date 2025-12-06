import { deferThrow } from 'vest-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as vest from '../../../../vest';

// Mock vest-utils to spy on deferThrow
vi.mock('vest-utils', async () => {
  const vu = await vi.importActual('vest-utils');
  return {
    ...vu,
    deferThrow: vi.fn(),
  };
});

describe('IsolateTestReconciler', () => {
  let firstRun = true;

  beforeEach(() => {
    firstRun = true;
    vi.clearAllMocks();
  });

  describe('useOrderResult', () => {
    it('Should emit DEFER_THROW event and call deferThrow when tests are called in different order', () => {
      const suite = vest.create(() => {
        // First run: test f1
        if (firstRun) {
          vest.test('f1', () => false);
        } else {
          // Second run: test f2 (different order/identity)
          vest.test('f2', () => false);
        }
      });

      // First run
      suite.run();
      firstRun = false;

      expect(deferThrow).not.toHaveBeenCalled();

      // Second run - triggers reorder detection
      suite.run();

      expect(deferThrow).toHaveBeenCalledWith(
        expect.stringContaining(
          'Vest Critical Error: Tests called in different order than previous run.',
        ),
      );
    });
  });
});

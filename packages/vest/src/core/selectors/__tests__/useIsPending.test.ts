import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VestRuntime } from 'vestjs-runtime';

import { useIsPending, useMapFirstPending } from '../useIsPending';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

vi.mock('vestjs-runtime', async importOriginal => {
  const actual = await importOriginal<typeof import('vestjs-runtime')>();
  return {
    ...actual,
    VestRuntime: {
      usePendingIsolates: vi.fn(),
    },
  };
});

vi.mock('../../isolate/IsolateTest/VestTest', () => ({
  VestTest: {
    getData: vi.fn(),
  },
}));

describe('useIsPending', () => {
  let pendingIsolates: Set<any>;

  beforeEach(() => {
    pendingIsolates = new Set();
    vi.mocked(VestRuntime.usePendingIsolates).mockReturnValue([
      pendingIsolates,
    ]);
  });

  it('Should return false when there are no pending isolates', () => {
    expect(useIsPending()).toBe(false);
  });

  it('Should return true when there are pending isolates and no field name is provided', () => {
    pendingIsolates.add({});
    expect(useIsPending()).toBe(true);
  });

  it('Should return false when field name is provided but no matching pending isolate found', () => {
    const isolate = {};
    pendingIsolates.add(isolate);
    vi.mocked(VestTest.getData).mockReturnValue({
      fieldName: 'otherField',
    } as any);

    expect(useIsPending('targetField')).toBe(false);
  });

  it('Should return true when field name is provided and matching pending isolate found', () => {
    const isolate = {};
    pendingIsolates.add(isolate);
    vi.mocked(VestTest.getData).mockReturnValue({
      fieldName: 'targetField',
    } as any);

    expect(useIsPending('targetField')).toBe(true);
  });
});

describe('useMapFirstPending', () => {
  let pendingIsolates: Set<any>;

  beforeEach(() => {
    pendingIsolates = new Set();
    vi.mocked(VestRuntime.usePendingIsolates).mockReturnValue([
      pendingIsolates,
    ]);
  });

  it('Should return null when there are no pending isolates', () => {
    const callback = vi.fn();
    expect(useMapFirstPending(callback)).toBeNull();
    expect(callback).not.toHaveBeenCalled();
  });

  it('Should iterate over pending isolates', () => {
    const isolate1 = { id: 1 };
    const isolate2 = { id: 2 };
    pendingIsolates.add(isolate1);
    pendingIsolates.add(isolate2);

    const callback = vi.fn();
    useMapFirstPending(callback);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(isolate1, expect.any(Function));
    expect(callback).toHaveBeenCalledWith(isolate2, expect.any(Function));
  });

  it('Should return the value passed to breakout and stop iteration', () => {
    const isolate1 = { id: 1 };
    const isolate2 = { id: 2 };
    const isolate3 = { id: 3 };
    pendingIsolates.add(isolate1);
    pendingIsolates.add(isolate2);
    pendingIsolates.add(isolate3);

    const callback = vi.fn((isolate, breakout) => {
      if (isolate.id === 2) {
        breakout('found it');
      }
    });

    const result = useMapFirstPending(callback);

    expect(result).toBe('found it');
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(isolate1, expect.any(Function));
    expect(callback).toHaveBeenCalledWith(isolate2, expect.any(Function));
    expect(callback).not.toHaveBeenCalledWith(isolate3, expect.any(Function));
  });
});

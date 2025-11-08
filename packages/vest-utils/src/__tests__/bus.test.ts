import { createBus } from 'bus';
import { describe, it, expect, vi } from 'vitest';

describe('bus', () => {
  it('should be a function', () => {
    expect(createBus).toBeInstanceOf(Function);
  });

  it('should return a bus', () => {
    const bus = createBus();
    expect(bus).toBeInstanceOf(Object);
    expect(bus.emit).toBeInstanceOf(Function);
    expect(bus.on).toBeInstanceOf(Function);
  });

  it('should emit events', () => {
    const bus = createBus();
    const spy = vi.fn();
    bus.on('test', spy);
    bus.emit('test');
    expect(spy).toHaveBeenCalled();
  });

  it('should emit events with data', () => {
    const bus = createBus();
    const spy = vi.fn();
    bus.on('test', spy);
    bus.emit('test', 'testData');
    expect(spy).toHaveBeenCalledWith('testData');
  });

  it('should emit events with multiple listeners', () => {
    const bus = createBus();
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    bus.on('test', spy1);
    bus.on('test', spy2);
    bus.emit('test');
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should emit events with multiple listeners and data', () => {
    const bus = createBus();
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    bus.on('test', spy1);
    bus.on('test', spy2);
    bus.emit('test', 'test1');
    expect(spy1).toHaveBeenCalledWith('test1');
    expect(spy2).toHaveBeenCalledWith('test1');
  });

  test('on returns an object with an `off` function', () => {
    const bus = createBus();
    const spy = vi.fn();
    const off = bus.on('test', spy);
    expect(off).toBeInstanceOf(Object);
    expect(off.off).toBeInstanceOf(Function);
  });

  test('off should remove a listener', () => {
    const bus = createBus();
    const spy = vi.fn();
    const off = bus.on('test', spy);
    off.off();
    bus.emit('test');
    expect(spy).not.toHaveBeenCalled();
  });

  test('off should only remove specific handler', () => {
    const bus = createBus();
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    const off = bus.on('test', spy1);
    bus.on('test', spy2);
    off.off();
    bus.emit('test');
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  describe('"ANY" wildcard (*)', () => {
    it('Should run the wildcard handler on any event', () => {
      const bus = createBus();
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      const spy3 = vi.fn();
      bus.on('t1', spy1);
      bus.on('t2', spy2);
      bus.on('*', spy3);
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).not.toHaveBeenCalled();
      bus.emit('t1');
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(0);
      expect(spy3).toHaveBeenCalledTimes(1);
      bus.emit('t2');
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy3).toHaveBeenCalledTimes(2);
    });

    it('Should call the wildcard last, regardless of when it was defined', () => {
      const bus = createBus();
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      const spy3 = vi.fn();
      const spy4 = vi.fn();
      bus.on('t1', spy1);
      bus.on('*', spy4);
      bus.on('t1', spy2);
      bus.on('t1', spy3);
      bus.emit('t1');
      const invocations = [spy1, spy2, spy3, spy4]
        .map(i => i.mock.invocationCallOrder[0])
        .sort();

      expect(invocations).toEqual([
        spy1.mock.invocationCallOrder[0],
        spy2.mock.invocationCallOrder[0],
        spy3.mock.invocationCallOrder[0],
        spy4.mock.invocationCallOrder[0],
      ]);
    });
  });
});

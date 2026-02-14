import { CB } from 'vest-utils';
import { describe, it, expect } from 'vitest';

import { Isolate, TIsolate } from '../../Isolate/Isolate';
import { IsolateKeys } from '../../Isolate/IsolateKeys';
import { IsolateSerializer } from '../IsolateSerializer';
import { IReconciler, VestRuntime } from '../../vestjs-runtime';

describe('IsolateSerializer: Transient', () => {
  function withRunTime<T>(fn: CB<T>) {
    return VestRuntime.Run(
      VestRuntime.createRef({} as IReconciler, v => v),
      () => fn(),
    );
  }

  it('should drop transient nodes during serialization', () => {
    let root!: TIsolate;

    withRunTime(() => {
      root = Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, { someData: true }, 'A');
        Isolate.create('Debounce', () => {}, { transient: true });
        Isolate.create('Test', () => {}, { someData: true }, 'B');
      });
    });

    const serialized = IsolateSerializer.serialize(root, v => v);
    const parsed = IsolateSerializer.deserialize(serialized);

    // Transient node should be stripped — only 2 children remain
    expect(parsed.children).toHaveLength(2);
    expect(parsed.children![0][IsolateKeys.Type]).toBe('Test');
    expect(parsed.children![0].key).toBe('A');
    expect(parsed.children![1][IsolateKeys.Type]).toBe('Test');
    expect(parsed.children![1].key).toBe('B');
  });

  it('should preserve non-transient nodes fully', () => {
    let root!: TIsolate;

    withRunTime(() => {
      root = Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'A');
        Isolate.create('Test', () => {}, {}, 'B');
      });
    });

    const serialized = IsolateSerializer.serialize(root, v => v);
    const parsed = IsolateSerializer.deserialize(serialized);

    expect(parsed.children).toHaveLength(2);
  });

  it('should handle nested transient children', () => {
    let root!: TIsolate;

    withRunTime(() => {
      root = Isolate.create('Root', () => {
        Isolate.create('Group', () => {
          Isolate.create('Test', () => {}, {}, 'inner-A');
          Isolate.create('Skip', () => {}, { transient: true });
          Isolate.create('Test', () => {}, {}, 'inner-B');
        });
      });
    });

    const serialized = IsolateSerializer.serialize(root, v => v);
    const parsed = IsolateSerializer.deserialize(serialized);

    // Root has 1 child (Group)
    expect(parsed.children).toHaveLength(1);
    // Group should have 2 children (transient stripped)
    const group = parsed.children![0];
    expect(group.children).toHaveLength(2);
    expect(group.children![0].key).toBe('inner-A');
    expect(group.children![1].key).toBe('inner-B');
  });

  it('should produce identical output when no transient nodes exist (CoW identity)', () => {
    let root!: TIsolate;

    withRunTime(() => {
      root = Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'X');
        Isolate.create('Test', () => {}, {}, 'Y');
      });
    });

    // Serialize twice — both should produce the exact same string
    const first = IsolateSerializer.serialize(root, v => v);
    const second = IsolateSerializer.serialize(root, v => v);
    expect(first).toBe(second);

    // And the deserialized structure should match
    const parsed = IsolateSerializer.deserialize(first);
    expect(parsed.children).toHaveLength(2);
    expect(parsed.children![0].key).toBe('X');
    expect(parsed.children![1].key).toBe('Y');
  });
});

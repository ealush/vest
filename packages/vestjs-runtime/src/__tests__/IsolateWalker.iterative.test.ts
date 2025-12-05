import { describe, it, expect, vi } from 'vitest';
import { makeResult } from 'vest-utils';
import { walk } from '../IsolateWalker';
import { TIsolate } from '../Isolate/Isolate';

describe('IsolateWalker Iterative', () => {
  it('Should traverse in Pre-Order (Parent before Children)', () => {
    // Tree Structure:
    // root
    //  |- child_1
    //  |- child_2
    //      |- grandchild_2_1
    const tree = {
      data: { id: 'root' },
      children: [
        { data: { id: 'child_1' }, children: [] },
        {
          data: { id: 'child_2' },
          children: [{ data: { id: 'grandchild_2_1' }, children: [] }],
        },
      ],
    };

    const visited: string[] = [];
    walk(tree as unknown as TIsolate, node => {
      visited.push(node.data.id);
      return makeResult.Ok(undefined);
    });

    // Expect: root -> child_1 -> child_2 -> grandchild_2_1
    expect(visited).toEqual(['root', 'child_1', 'child_2', 'grandchild_2_1']);
  });

  it('Should handle deep nesting without stack overflow', () => {
    // Create a linked list of depth 100,000
    // root -> child_0 -> child_1 ... -> child_99999
    let current: any = { data: { id: 'root' }, children: [] };
    const root = current;
    const depth = 100000;

    for (let i = 0; i < depth; i++) {
      const next = { data: { id: `child_${i}` }, children: [] };
      current.children.push(next);
      current = next;
    }

    const visitSpy = vi.fn(() => makeResult.Ok(undefined));

    // This would throw RangeError in recursive implementation
    expect(() => walk(root, visitSpy)).not.toThrow();

    // Depth + 1 (root)
    expect(visitSpy).toHaveBeenCalledTimes(depth + 1);
  });

  it('Should respect breakout in iterative loop', () => {
    const tree = {
      data: { id: 'root' },
      children: [
        { data: { id: 'child_1' }, children: [] },
        { data: { id: 'child_2' }, children: [] }, // Break here
        { data: { id: 'child_3' }, children: [] }, // Should not visit
      ],
    };

    const visited: string[] = [];
    walk(tree as unknown as TIsolate, node => {
      visited.push(node.data.id);
      if (node.data.id === 'child_2') {
        return makeResult.Err(undefined);
      }
      return makeResult.Ok(undefined);
    });

    expect(visited).toEqual(['root', 'child_1', 'child_2']);
  });
});

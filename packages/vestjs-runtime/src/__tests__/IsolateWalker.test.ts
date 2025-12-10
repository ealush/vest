import { describe, it, expect, beforeEach } from 'vitest';
import { makeResult } from 'vest-utils';

import { TIsolate } from '../Isolate/Isolate';
import {
  walk,
  reduce,
  findAll,
  find,
  every,
  has,
  some,
  pluck,
  closest,
  closestExists,
  findClosest,
} from '../IsolateWalker';

type WalkedNode = TIsolate<{ id: string }>;

describe('walk', () => {
  let tree = {} as unknown as WalkedNode;
  beforeEach(() => {
    tree = {
      data: { id: '0' },
      children: [
        {
          data: { id: '0.0' },
          children: [
            { data: { id: '0.0.0' } },
            {
              data: { id: '0.0.1' },
              children: [
                { data: { id: '0.0.1.0' } },
                { data: { id: '0.0.1.1' } },
              ],
            },
            { data: { id: '0.0.2' } },
          ],
        },
        { data: { id: '0.1' } },
      ],
    } as unknown as WalkedNode;
  });

  it('Should walk through the tree', () => {
    const visited: Set<string> = new Set();
    walk(tree, isolate => {
      visited.add(isolate.data.id);
      return makeResult.Ok(undefined);
    });

    expect(visited).toEqual(
      new Set([
        '0.0.0',
        '0.0.1.0',
        '0.0.1.1',
        '0.0.1',
        '0.0.2',
        '0.0',
        '0.1',
        '0',
      ]),
    );
  });

  it('Should traverse the tree in a depth-first order', () => {
    const visited: string[] = [];
    walk(tree, isolate => {
      visited.push(isolate.data.id);
      return makeResult.Ok(undefined);
    });

    expect(visited).toEqual([
      '0',
      '0.0',
      '0.0.0',
      '0.0.1',
      '0.0.1.0',
      '0.0.1.1',
      '0.0.2',
      '0.1',
    ]);
  });

  describe('Breakout', () => {
    it('Should stop the walk when breakout is called', () => {
      const visited: Array<string> = [];
      walk(tree, isolate => {
        visited.push(isolate.data.id);
        if (isolate.data.id === '0.0.1') {
          return makeResult.Err(undefined);
        }
        return makeResult.Ok(undefined);
      });

      expect(visited).toEqual(['0', '0.0', '0.0.0', '0.0.1']);
    });
  });

  describe('VisitOnly', () => {
    it('Should only visit nodes that satisfy the predicate', () => {
      const visited: Array<string> = [];
      walk(
        tree,
        isolate => {
          visited.push(isolate.data.id);
          return makeResult.Ok(undefined);
        },
        isolate => isolate.data.id.endsWith('1'),
      );

      expect(visited).toEqual(['0.0.1', '0.0.1.1', '0.1']);
    });
  });
});

describe('reduce', () => {
  let node = {} as unknown as TIsolate<{ value: number }>;
  beforeEach(() => {
    node = {
      data: { value: 1 },
      children: [
        {
          data: { value: 2 },
          children: [
            { data: { value: 1 }, $type: 's' },
            {
              data: { value: 2 },
              children: [{ data: { value: 0 } }, { data: { value: 1 } }],
            },
            { data: { value: 1 }, $type: 's' },
          ],
        },
        { data: { value: 0 } },
      ],
    } as unknown as TIsolate<{ value: number }>;
  });

  it('Should return the accumulated value of the tree', () => {
    const sum = reduce(
      node,
      (acc, isolate) => makeResult.Ok(acc + isolate.data.value),
      0,
    );
    expect(sum).toBe(8);
  });

  it('Should traverse the tree in a depth-first order', () => {
    const visited: string[] = [];
    reduce(
      node,
      (acc, isolate) => {
        visited.push(isolate.data.value);
        return makeResult.Ok(acc);
      },
      '',
    );

    expect(visited).toEqual([1, 2, 1, 2, 0, 1, 1, 0]);
  });

  describe('Breakout', () => {
    it('Should stop the walk when breakout is called', () => {
      const visited: Array<number> = [];
      reduce(
        node,
        (acc, isolate) => {
          visited.push(isolate.data.value);
          if (isolate.data.value === 2) {
            return makeResult.Err(acc);
          }
          return makeResult.Ok(acc);
        },
        '',
      );

      expect(visited).toEqual([1, 2]);
    });
  });

  describe('VisitOnly', () => {
    it('Should only visit nodes that satisfy the predicate', () => {
      const output = reduce(
        node,
        (acc, isolate) => {
          return makeResult.Ok(acc + isolate.data.value);
        },
        0,
        isolate => isolate.$type === 's',
      );

      expect(output).toBe(2);
    });
  });
});

describe('findAll', () => {
  let node = {} as unknown as TIsolate<{ value: number }>;
  beforeEach(() => {
    node = {
      data: { value: 100 },
      children: [
        {
          data: { value: 2 },
          children: [
            { data: { value: 100 }, $type: 's' },
            {
              data: { value: 2 },
              children: [{ data: { value: 0 } }, { data: { value: 100 } }],
            },
            { data: { value: 1 }, $type: 's' },
          ],
        },
        { data: { value: 0 } },
      ],
    } as unknown as TIsolate<{ value: number }>;
  });

  it('Should return all nodes that satisfy the predicate', () => {
    const output = findAll(node, isolate => isolate.data.value === 100);

    expect(output).toEqual([
      node,
      node.children?.[0]?.children?.[0],
      node.children?.[0]?.children?.[1]?.children?.[1],
    ]);
  });
});

describe('find', () => {
  let node = {} as unknown as TIsolate<{ value: number }>;
  beforeEach(() => {
    node = {
      data: { value: 1 },
      children: [
        {
          data: { value: 2 },
          children: [{ data: { value: 3 } }, { data: { value: 4 } }],
        },
      ],
    } as unknown as TIsolate<{ value: number }>;
  });

  it('should return null if no node matches', () => {
    expect(find(node, n => n.data.value === 999)).toBeNull();
  });

  it('should return the first node that matches', () => {
    const found = find(node, n => n.data.value === 3);
    expect(found).toBeDefined();
    expect(found?.data.value).toBe(3);
  });
});

describe('some', () => {
  let node = {} as unknown as TIsolate<{ value: number }>;
  beforeEach(() => {
    node = {
      data: { value: 1 },
      children: [{ data: { value: 2 } }],
    } as unknown as TIsolate<{ value: number }>;
  });

  it('should return true if any node matches', () => {
    expect(some(node, n => n.data.value === 2)).toBe(true);
  });

  it('should return false if no node matches', () => {
    expect(some(node, n => n.data.value === 3)).toBe(false);
  });
});

describe('every', () => {
  let node = {} as unknown as TIsolate<{ value: number }>;
  beforeEach(() => {
    node = {
      data: { value: 1 },
      children: [{ data: { value: 2 } }],
    } as unknown as TIsolate<{ value: number }>;
  });

  it('should return true if all nodes match', () => {
    expect(every(node, n => n.data.value > 0)).toBe(true);
  });

  it('should return false if any node fails match', () => {
    expect(every(node, n => n.data.value === 1)).toBe(false);
  });
});

describe('has', () => {
  let node = {} as unknown as TIsolate<{ value: number }>;
  beforeEach(() => {
    node = {
      data: { value: 1 },
      children: [{ data: { value: 2 } }],
    } as unknown as TIsolate<{ value: number }>;
  });

  it('should return true if a node matching visitOnly exists', () => {
    expect(has(node, n => n.data.value === 2)).toBe(true);
  });

  it('should return false if no node matches visitOnly', () => {
    expect(has(node, n => n.data.value === 3)).toBe(false);
  });
});

describe('pluck', () => {
  let node: TIsolate<{ value: number }>;

  beforeEach(() => {
    const child1 = { data: { value: 2 }, children: [] } as unknown as TIsolate<{
      value: number;
    }>;
    const child2 = { data: { value: 3 }, children: [] } as unknown as TIsolate<{
      value: number;
    }>;

    node = {
      data: { value: 1 },
      children: [child1, child2],
    } as unknown as TIsolate<{ value: number }>;

    // Set parents
    child1.parent = node;
    child2.parent = node;
  });

  it('should remove nodes that satisfy predicate', () => {
    pluck(node, n => n.data.value === 2);
    expect(node.children).toHaveLength(1);
    expect(node.children![0].data.value).toBe(3);
  });
});

describe('closest', () => {
  let root: TIsolate<{ value: number }>;
  let child: TIsolate<{ value: number }>;
  let grandchild: TIsolate<{ value: number }>;

  beforeEach(() => {
    root = { data: { value: 1 } } as unknown as TIsolate<{ value: number }>;
    child = { data: { value: 2 }, parent: root } as unknown as TIsolate<{
      value: number;
    }>;
    grandchild = { data: { value: 3 }, parent: child } as unknown as TIsolate<{
      value: number;
    }>;
  });

  it('should find closest ancestor satisfying predicate', () => {
    expect(closest(grandchild, n => n.data.value === 1)).toBe(root);
  });

  it('should return the node itself if it satisfies', () => {
    expect(closest(grandchild, n => n.data.value === 3)).toBe(grandchild);
  });

  it('should return null if not found', () => {
    expect(closest(grandchild, n => n.data.value === 999)).toBeNull();
  });
});

describe('closestExists', () => {
  let root: TIsolate<{ value: number }>;
  let child: TIsolate<{ value: number }>;

  beforeEach(() => {
    root = { data: { value: 1 } } as unknown as TIsolate<{ value: number }>;
    child = { data: { value: 2 }, parent: root } as unknown as TIsolate<{
      value: number;
    }>;
  });

  it('should return true if ancestor exists', () => {
    expect(closestExists(child, n => n.data.value === 1)).toBe(true);
  });

  it('should return false if no ancestor matches', () => {
    expect(closestExists(child, n => n.data.value === 999)).toBe(false);
  });
});

describe('findClosest', () => {
  let root: TIsolate<{ value: number }>;
  let child: TIsolate<{ value: number }>;
  let sibling: TIsolate<{ value: number }>;

  beforeEach(() => {
    root = { data: { value: 1 }, children: [] } as unknown as TIsolate<{
      value: number;
    }>;

    child = {
      data: { value: 2 },
      parent: root,
      children: [],
    } as unknown as TIsolate<{ value: number }>;
    sibling = {
      data: { value: 3 },
      parent: root,
      children: [],
    } as unknown as TIsolate<{ value: number }>;

    root.children = [child, sibling];
  });

  it('should find a sibling (descendant of ancestor)', () => {
    // Start from child, find sibling (which is child of root)
    expect(findClosest(child, n => n.data.value === 3)).toBe(sibling);
  });

  it('should return null if not found', () => {
    expect(findClosest(child, n => n.data.value === 999)).toBeNull();
  });
});

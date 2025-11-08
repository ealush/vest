import { walk, reduce, findAll } from 'IsolateWalker';
import { describe, it, expect, beforeEach } from 'vitest'; // import { TIsolate } from 'Isolate';

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
    });

    expect(visited).toEqual([
      '0.0.0',
      '0.0.1.0',
      '0.0.1.1',
      '0.0.1',
      '0.0.2',
      '0.0',
      '0.1',
      '0',
    ]);
  });

  describe('Breakout', () => {
    it('Should stop the walk when breakout is called', () => {
      const visited: Array<string> = [];
      walk(tree, (isolate, breakout) => {
        visited.push(isolate.data.id);
        if (isolate.data.id === '0.0.1') {
          breakout();
        }
      });

      expect(visited).toEqual(['0.0.0', '0.0.1.0', '0.0.1.1', '0.0.1']);
    });
  });

  describe('VisitOnly', () => {
    it('Should only visit nodes that satisfy the predicate', () => {
      const visited: Array<string> = [];
      walk(
        tree,
        isolate => {
          visited.push(isolate.data.id);
        },
        isolate => isolate.data.id.endsWith('1'),
      );

      expect(visited).toEqual(['0.0.1.1', '0.0.1', '0.1']);
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
    const sum = reduce(node, (acc, isolate) => acc + isolate.data.value, 0);
    expect(sum).toBe(8);
  });

  it('Should traverse the tree in a depth-first order', () => {
    const visited: string[] = [];
    reduce(
      node,
      (acc, isolate) => {
        visited.push(isolate.data.value);
        return acc;
      },
      '',
    );

    expect(visited).toEqual([1, 0, 1, 2, 1, 2, 0, 1]);
  });

  describe('Breakout', () => {
    it('Should stop the walk when breakout is called', () => {
      const visited: Array<number> = [];
      reduce(
        node,
        (acc, isolate, breakout) => {
          visited.push(isolate.data.value);
          if (isolate.data.value === 2) {
            breakout();
          }
          return acc;
        },
        '',
      );

      expect(visited).toEqual([1, 0, 1, 2]);
    });
  });

  describe('VisitOnly', () => {
    it('Should only visit nodes that satisfy the predicate', () => {
      const output = reduce(
        node,
        (acc, isolate) => {
          return acc + isolate.data.value;
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
      node.children?.[0]?.children?.[0],
      node.children?.[0]?.children?.[1]?.children?.[1],
      node,
    ]);
  });
});

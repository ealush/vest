import { TIsolate } from 'Isolate';
import { reduce } from 'IsolateWalker';

type MoodyChild = TIsolate<{ mood: string }>;

describe('reduce', () => {
  it('Should return the accumulated value of the tree', () => {
    const child = {
      data: { mood: 'happy' },
      children: [
        { data: { mood: 'happy' } } as unknown as MoodyChild,
        { data: { mood: 'happy' } } as unknown as MoodyChild,
        { data: { mood: 'happy' } } as unknown as MoodyChild,
      ],
    } as unknown as MoodyChild;
    const child1 = {
      data: { mood: 'sad' },
      children: [
        { data: { mood: 'happy' } } as MoodyChild,
        { data: { mood: 'sad' } } as MoodyChild,
      ],
    } as unknown as MoodyChild;
    const isolate = {
      children: [child, child1],
    } as unknown as TIsolate;

    const result = reduce(
      isolate,
      (acc, isolate) => {
        if (isolate.data.mood === 'happy') {
          acc.happyCount++;
        } else {
          acc.sadCount++;
        }
        return acc;
      },
      {
        happyCount: 0,
        sadCount: 0,
      },
    );

    expect(result).toEqual({
      happyCount: 5,
      sadCount: 2,
    });
  });

  describe('Execution order', () => {
    it('Should execute the callback in a depth-first order', () => {
      const node = {
        data: { mood: 'happy' },
        children: [
          {
            data: { mood: 'frustrated' },
            children: [
              { data: { mood: 'anxious' } } as unknown as MoodyChild,
              {
                data: { mood: 'relaxed' },
                children: [
                  { data: { mood: 'annoyed' } } as unknown as MoodyChild,
                ],
              } as unknown as MoodyChild,
            ],
          } as unknown as MoodyChild,
          {
            data: { mood: 'angry' },
            children: [{ data: { mood: 'excited' } } as unknown as MoodyChild],
          } as unknown as MoodyChild,
          { data: { mood: 'meh' } } as unknown as MoodyChild,
        ],
      } as unknown as MoodyChild;

      const result = reduce(
        node,
        (acc, isolate) => {
          acc.push(isolate.data.mood);
          return acc;
        },
        [] as string[],
      );

      expect(result).toEqual([
        'anxious',
        'annoyed',
        'relaxed',
        'frustrated',
        'excited',
        'angry',
        'meh',
        'happy',
      ]);
    });
  });

  describe('When breakout gets called', () => {
    it('Should stop the walk and return the current result', () => {
      const child = {
        data: { mood: 'happy' },
        children: [
          { data: { mood: 'happy' } } as unknown as MoodyChild,
          { data: { mood: 'happy' } } as unknown as MoodyChild,
          { data: { mood: 'happy' } } as unknown as MoodyChild,
        ],
      } as unknown as MoodyChild;
      const child1 = {
        data: { mood: 'sad' },
        children: [
          { data: { mood: 'happy' } } as MoodyChild,
          { data: { mood: 'sad' } } as MoodyChild,
        ],
      } as unknown as MoodyChild;
      const isolate = {
        children: [child, child1],
      } as unknown as TIsolate;

      const result = reduce(
        isolate,
        (acc, isolate, breakout) => {
          if (isolate.data.mood === 'happy') {
            acc.happyCount++;
          } else {
            acc.sadCount++;
          }
          if (acc.happyCount === 2) {
            breakout();
          }
          return acc;
        },
        {
          happyCount: 0,
          sadCount: 0,
        },
      );

      expect(result).toEqual({
        happyCount: 2,
        sadCount: 0,
      });
    });
  });
});

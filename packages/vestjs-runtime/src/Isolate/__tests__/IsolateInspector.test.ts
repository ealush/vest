import { describe, it, expect } from 'vitest';

import { TIsolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';

describe('IsolateInspector', () => {
  describe('at', () => {
    describe('When the isolate is nullish', () => {
      it('Should return null', () => {
        expect(IsolateInspector.at(null, 0)).toBeNull();
      });
    });

    describe('When the children are nullish', () => {
      it('Should return null', () => {
        const isolate = { children: null } as unknown as TIsolate;

        expect(IsolateInspector.at(isolate, 0)).toBeNull();
      });
    });

    describe('When the child does not exist', () => {
      it('Should return null', () => {
        const isolate = { children: [] } as unknown as TIsolate;

        expect(IsolateInspector.at(isolate, 0)).toBeNull();
      });
    });

    describe('When the child exists', () => {
      it('Should return the child', () => {
        const child = {} as TIsolate;
        const child1 = {} as TIsolate;
        const isolate = { children: [child, child1] } as unknown as TIsolate;

        expect(IsolateInspector.at(isolate, 0)).toBe(child);
        expect(IsolateInspector.at(isolate, 1)).toBe(child1);
      });
    });
  });

  describe('cursor', () => {
    describe('When the isolate is nullish', () => {
      it('Should return 0', () => {
        expect(IsolateInspector.cursor(null)).toBe(0);
      });
    });

    describe('When the children are nullish', () => {
      it('Should return 0', () => {
        const isolate = { children: null } as unknown as TIsolate;

        expect(IsolateInspector.cursor(isolate)).toBe(0);
      });
    });

    describe('When the children exist', () => {
      it('Should return the length of the children', () => {
        const child = {} as TIsolate;
        const child1 = {} as TIsolate;
        const isolate = { children: [child, child1] } as unknown as TIsolate;

        expect(IsolateInspector.cursor(isolate)).toBe(2);
      });
    });
  });

  describe('canReorder', () => {
    describe('When the isolate is nullish', () => {
      it('Should return false', () => {
        expect(IsolateInspector.canReorder(null)).toBe(false);
      });
    });

    describe('When the isolate does not allow reordering', () => {
      it('Should return false', () => {
        const isolate = { allowReorder: false } as unknown as TIsolate;

        expect(IsolateInspector.canReorder(isolate)).toBe(false);
      });
    });

    describe('When the isolate does not allow reordering but a parent does', () => {
      it('Should return true', () => {
        const root = { allowReorder: false } as unknown as TIsolate;
        const parent = {
          allowReorder: true,
          parent: root,
        } as unknown as TIsolate;
        const isolate = { allowReorder: false, parent } as unknown as TIsolate;

        expect(IsolateInspector.canReorder(isolate)).toBe(true);
      });

      describe('When only the root allows reordering', () => {
        it('Should return false', () => {
          const root = { allowReorder: true } as unknown as TIsolate;
          const parent = {
            allowReorder: false,
            parent: root,
          } as unknown as TIsolate;
          const isolate = {
            allowReorder: false,
            parent,
          } as unknown as TIsolate;

          expect(IsolateInspector.canReorder(isolate)).toBe(false);
        });
      });
    });
  });

  describe('usesKey', () => {
    describe('When the node is nullish', () => {
      it('Should return false', () => {
        expect(IsolateInspector.usesKey(null)).toBe(false);
      });
    });

    describe('When the node does not have a key', () => {
      it('Should return false', () => {
        const isolate = { key: null } as unknown as TIsolate;

        expect(IsolateInspector.usesKey(isolate)).toBe(false);
      });
    });

    describe('When the node has a key', () => {
      it('Should return true', () => {
        const isolate = { key: 'key' } as unknown as TIsolate;

        expect(IsolateInspector.usesKey(isolate)).toBe(true);
      });
    });
  });
});

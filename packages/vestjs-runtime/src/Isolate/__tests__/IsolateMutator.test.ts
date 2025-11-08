import { TIsolate } from 'Isolate';
import { IsolateMutator } from 'IsolateMutator';
import { describe, it, expect, vi } from 'vitest';

describe('IsolateMutator', () => {
  describe('setParent', () => {
    it('should set parent', () => {
      const parent = {} as TIsolate;
      const isolate = {} as TIsolate;

      expect(isolate.parent).toBeUndefined();
      expect(IsolateMutator.setParent(isolate, parent)).toBe(isolate);
      expect(isolate.parent).toBe(parent);
    });

    describe('When the child already has a parent', () => {
      it('Should set the new parent of the child', () => {
        const parent1 = {} as TIsolate;
        const parent2 = {} as TIsolate;
        const isolate = {} as TIsolate;

        IsolateMutator.setParent(isolate, parent1);
        expect(isolate.parent).toBe(parent1);
        IsolateMutator.setParent(isolate, parent2);
        expect(isolate.parent).toBe(parent2);
      });
    });
  });

  describe('saveOutput', () => {
    it('should save output', () => {
      const isolate = {} as TIsolate;
      const output = {};

      expect(isolate.output).toBeUndefined();
      expect(IsolateMutator.saveOutput(isolate, output)).toBe(isolate);
      expect(isolate.output).toBe(output);
    });
  });

  describe('setKey', () => {
    it('should set key', () => {
      const isolate = {} as TIsolate;
      const key = 'foo';

      expect(isolate.key).toBeUndefined();
      expect(IsolateMutator.setKey(isolate, key)).toBe(isolate);
      expect(isolate.key).toBe(key);
    });
  });

  describe('addChild', () => {
    it('should add child', () => {
      const isolate = { children: [] } as unknown as TIsolate;
      const child1 = {} as TIsolate;
      const child2 = {} as TIsolate;

      expect(isolate.children).toEqual([]);
      IsolateMutator.addChild(isolate, child1);
      expect(isolate.children).toEqual([child1]);
      IsolateMutator.addChild(isolate, child2);
      expect(isolate.children).toEqual([child1, child2]);
    });

    it('should set parent of the child', () => {
      const isolate = { children: [] } as unknown as TIsolate;
      const child = {} as TIsolate;

      expect(child.parent).toBeUndefined();
      IsolateMutator.addChild(isolate, child);
      expect(child.parent).toBe(isolate);
    });
  });

  describe('removeChild', () => {
    it('Should remove child', () => {
      const child1 = {} as TIsolate;
      const child2 = {} as TIsolate;
      const isolate = { children: [child1, child2] } as unknown as TIsolate;

      expect(isolate.children).toEqual([child1, child2]);
      IsolateMutator.removeChild(isolate, child1);
      expect(isolate.children).toEqual([child2]);
      IsolateMutator.removeChild(isolate, child2);
      expect(isolate.children).toEqual([]);
    });

    describe('When the child does not exist', () => {
      it('Should no-op', () => {
        const child = {} as TIsolate;
        const isolate = { children: [] } as unknown as TIsolate;

        expect(isolate.children).toEqual([]);
        IsolateMutator.removeChild(isolate, child);
        expect(isolate.children).toEqual([]);
      });
    });
  });

  describe('slice', () => {
    it('Should slice children', () => {
      const child1 = {} as TIsolate;
      const child2 = {} as TIsolate;
      const isolate = { children: [child1, child2] } as unknown as TIsolate;

      expect(isolate.children).toEqual([child1, child2]);
      IsolateMutator.slice(isolate, 1);
      expect(isolate.children).toEqual([child1]);
    });

    describe('When children are nullish', () => {
      it('Should no-op', () => {
        const isolate = { children: null } as unknown as TIsolate;

        expect(isolate.children).toBeNull();
        IsolateMutator.slice(isolate, 1);
        expect(isolate.children).toBeNull();
      });
    });
  });

  describe('abort', () => {
    it('Should abort the controller', () => {
      const isolate = {
        abortController: { abort: vi.fn() },
      } as unknown as TIsolate;

      expect(isolate.abortController.abort).not.toHaveBeenCalled();
      IsolateMutator.abort(isolate);
      expect(isolate.abortController.abort).toHaveBeenCalled();
    });

    describe('When the controller is nullish', () => {
      it('Should no-op', () => {
        const isolate = { abortController: null } as unknown as TIsolate;

        expect(isolate.abortController).toBeNull();
        IsolateMutator.abort(isolate);
        expect(isolate.abortController).toBeNull();
      });
    });

    it('Should abort the controller with the passed reason', () => {
      const isolate = {
        abortController: { abort: vi.fn() },
      } as unknown as TIsolate;

      expect(isolate.abortController.abort).not.toHaveBeenCalled();
      IsolateMutator.abort(isolate, 'foo');
      expect(isolate.abortController.abort).toHaveBeenCalledWith('foo');
    });
  });
});

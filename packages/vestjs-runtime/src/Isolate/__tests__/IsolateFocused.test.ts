import { describe, it, expect } from 'vitest';
import { CB } from 'vest-utils';

import { IReconciler } from '../../Reconciler';
import {
  IsolateFocused,
  FocusModes,
  FocusSelectors,
  VestIsolateTypeFocused,
} from '../IsolateFocused';
import * as VestRuntime from '../../VestRuntime';
import { IsolateKeys } from '../IsolateKeys';
import { Isolate } from '../Isolate';

describe('IsolateFocused', () => {
  function withRunTime<T>(fn: CB<T>) {
    return VestRuntime.Run(
      VestRuntime.createRef((() => null) as unknown as IReconciler, v => v),
      () => fn(),
    );
  }

  describe('Focus Modes', () => {
    it('Should expose ONLY and SKIP focus modes', () => {
      expect(FocusModes.ONLY).toBe('only');
      expect(FocusModes.SKIP).toBe('skip');
    });
  });

  describe('Isolate creation', () => {
    it('Should return undefined if no fields are provided and matchAll is false', () => {
      let node: any;
      withRunTime(() => {
        Isolate.create('Root', () => {
          node = IsolateFocused(FocusModes.ONLY, []);
        });
      });
      expect(node).toBeUndefined();

      let node2: any;
      withRunTime(() => {
        Isolate.create('Root', () => {
          node2 = IsolateFocused(FocusModes.ONLY);
        });
      });
      expect(node2).toBeUndefined();
    });

    it('Should create a focused isolate when matchAll is true', () => {
      let node: any;
      withRunTime(() => {
        Isolate.create('Root', () => {
          node = IsolateFocused(FocusModes.SKIP, true);
        });
      });
      expect(node[IsolateKeys.Type]).toBe(VestIsolateTypeFocused);
      expect(node[IsolateKeys.Transient]).toBe(true);
      expect(node.data).toEqual({
        focusMode: FocusModes.SKIP,
        match: [],
        matchAll: true,
      });
    });

    it('Should create a focused isolate with specified fields', () => {
      let node: any;
      withRunTime(() => {
        Isolate.create('Root', () => {
          node = IsolateFocused(FocusModes.ONLY, ['field1', 'field2']);
        });
      });
      expect(node[IsolateKeys.Type]).toBe(VestIsolateTypeFocused);
      expect(node[IsolateKeys.Transient]).toBe(true);
      expect(node.data).toEqual({
        focusMode: FocusModes.ONLY,
        match: ['field1', 'field2'],
        matchAll: false,
      });
    });
  });

  describe('FocusSelectors', () => {
    describe('isIsolateFocused', () => {
      it('Should correctly identify a focused isolate', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.ONLY, ['field1']);
          });
        });
        expect(FocusSelectors.isIsolateFocused(node)).toBe(true);
      });

      it('Should return false for non-focused isolates', () => {
        let node: any;
        withRunTime(() => {
          node = Isolate.create('Root', () => {});
        });
        expect(FocusSelectors.isIsolateFocused(node)).toBe(false);
      });
    });

    describe('isSkipFocused', () => {
      it('Should return false if focus is undefined', () => {
        expect(FocusSelectors.isSkipFocused(undefined, 'field1')).toBe(false);
      });

      it('Should return false if focus mode is missing or not SKIP', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.ONLY, ['field1']);
          });
        });
        expect(FocusSelectors.isSkipFocused(node, 'field1')).toBe(false);
      });

      it('Should return true if focus is SKIP and matchAll is true', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.SKIP, true);
          });
        });
        expect(FocusSelectors.isSkipFocused(node)).toBe(true);
        expect(FocusSelectors.isSkipFocused(node, 'anyField')).toBe(true);
      });

      it('Should return true if focus is SKIP and matches the fieldName', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.SKIP, ['field1']);
          });
        });
        expect(FocusSelectors.isSkipFocused(node, 'field1')).toBe(true);
        expect(FocusSelectors.isSkipFocused(node, 'field2')).toBe(false);
      });

      it('Should return true if no fieldName is provided but matches exist', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.SKIP, ['field1']);
          });
        });
        expect(FocusSelectors.isSkipFocused(node)).toBe(true);
      });
    });

    describe('isOnlyFocused', () => {
      it('Should return false if focus is undefined', () => {
        expect(FocusSelectors.isOnlyFocused(undefined, 'field1')).toBe(false);
      });

      it('Should return false if focus mode is missing or not ONLY', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.SKIP, ['field1']);
          });
        });
        expect(FocusSelectors.isOnlyFocused(node, 'field1')).toBe(false);
      });

      it('Should return true if focus is ONLY and matches the fieldName', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.ONLY, ['field1', 'field2']);
          });
        });
        expect(FocusSelectors.isOnlyFocused(node, 'field1')).toBe(true);
        expect(FocusSelectors.isOnlyFocused(node, 'field3')).toBe(false);
      });

      it('Should return true if focus is ONLY and matchAll is true', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.ONLY, true);
          });
        });
        expect(FocusSelectors.isOnlyFocused(node)).toBe(true);
        expect(FocusSelectors.isOnlyFocused(node, 'anyField')).toBe(true);
      });

      it('Should return true if no fieldName is provided but matches exist', () => {
        let node: any;
        withRunTime(() => {
          Isolate.create('Root', () => {
            node = IsolateFocused(FocusModes.ONLY, ['field1']);
          });
        });
        expect(FocusSelectors.isOnlyFocused(node)).toBe(true);
      });
    });
  });
});

import { describe, it, expect } from 'vitest';
import { CB } from 'vest-utils';

import { IReconciler } from '../../Reconciler';
import { IsolateTransient } from '../IsolateTransient';
import * as VestRuntime from '../../VestRuntime';
import { IsolateKeys } from '../IsolateKeys';
import { Isolate } from '../Isolate';

describe('IsolateTransient', () => {
  function withRunTime<T>(fn: CB<T>) {
    return VestRuntime.Run(
      VestRuntime.createRef((() => null) as unknown as IReconciler, v => v),
      () => fn(),
    );
  }

  it('should create an isolate with transient flag set to true', () => {
    let node: any;
    withRunTime(() => {
      Isolate.create('Root', () => {
        node = IsolateTransient(() => {});
      });
    });
    expect(node[IsolateKeys.Transient]).toBe(true);
  });

  it('should use default type "Transient" when no type is provided', () => {
    let node: any;
    withRunTime(() => {
      Isolate.create('Root', () => {
        node = IsolateTransient(() => {});
      });
    });
    expect(node[IsolateKeys.Type]).toBe('Transient');
  });

  it('should accept a custom type', () => {
    let node: any;
    withRunTime(() => {
      Isolate.create('Root', () => {
        node = IsolateTransient(() => {}, 'Debounce');
      });
    });
    expect(node[IsolateKeys.Type]).toBe('Debounce');
  });

  it('should merge custom payload with transient flag', () => {
    let node: any;
    withRunTime(() => {
      Isolate.create('Root', () => {
        node = IsolateTransient(() => {}, 'Custom', { myData: 42 });
      });
    });
    expect(node[IsolateKeys.Transient]).toBe(true);
    expect(node[IsolateKeys.Data]).toEqual({ myData: 42 });
  });
});

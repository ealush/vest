import { SuiteRuntimeRootContext } from 'ctx';
import * as walker from 'walker';

import { Isolate, IsolateTypes } from 'isolateTypes';

export class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: IsolateTypes
  ): void {
    walker.walk(SuiteRuntimeRootContext.useX(), callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.some(SuiteRuntimeRootContext.useX(), predicate, visitOnly);
  }

  static has(match: IsolateTypes): boolean {
    return walker.has(SuiteRuntimeRootContext.useX(), match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): Isolate | null {
    return walker.find(SuiteRuntimeRootContext.useX(), predicate, visitOnly);
  }
}

export function hasAnyTests(): boolean {
  return SuiteWalker.has(IsolateTypes.TEST);
}

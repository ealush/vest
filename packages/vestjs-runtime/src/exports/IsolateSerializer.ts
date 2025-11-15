import { ErrorStrings } from 'ErrorStrings';
import {
  Nullable,
  hasOwnProperty,
  invariant,
  isNullish,
  isStringValue,
  text,
} from 'vest-utils';
import { expandObject, minifyObject } from 'minifyObject';

import { TIsolate } from 'Isolate';
import { ExcludedFromDump, IsolateKeys } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';

export class IsolateSerializer {
  static deserialize(node: Record<string, any> | TIsolate | string): TIsolate {
    const expanded = expandNode(node);
    const queue = [expanded];

    while (queue.length) {
      const current = queue.shift();
      if (current) {
        processChildren(current, queue);
      }
    }

    return expanded;
  }

  static serialize(
    isolate: Nullable<TIsolate>,
    replacer: (value: any, key: string) => any,
  ): string {
    if (isNullish(isolate)) {
      return '';
    }

    const minified = minifyObject(isolate, (value: any, key: string) => {
      if (ExcludedFromDump.has(key as any)) {
        return undefined;
      }
      return replacer(value, key);
    });

    return JSON.stringify(minified);
  }

  static validateIsolate(
    node: Record<string, any> | TIsolate,
  ): asserts node is TIsolate {
    invariant(
      hasOwnProperty(node, IsolateKeys.Type),
      text(ErrorStrings.INVALID_ISOLATE_CANNOT_PARSE),
    );
  }
}

function processChildren(current: TIsolate, queue: TIsolate[]): void {
  const children = current.children;

  if (!children) {
    return;
  }

  current.children = children.map(child => {
    const nextChild = { ...child };

    IsolateMutator.setParent(nextChild, current);
    queue.push(nextChild);

    if (nextChild.key) {
      current.keys = current.keys ?? {};
      current.keys[nextChild.key] = nextChild;
    }

    return nextChild;
  });
}

function expandNode(node: Record<string, any> | TIsolate | string): TIsolate {
  const root = (
    isStringValue(node) ? JSON.parse(node) : ({ ...node } as TIsolate)
  ) as [any, any];

  const expanded = expandObject(...root);
  IsolateSerializer.validateIsolate(expanded);

  return expanded;
}

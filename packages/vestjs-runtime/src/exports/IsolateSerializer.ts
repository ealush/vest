import { ErrorStrings } from 'ErrorStrings';
import {
  Nullable,
  hasOwnProperty,
  invariant,
  isNotNullish,
  isNullish,
  isStringValue,
  text,
} from 'vest-utils';

import { TIsolate } from 'Isolate';
import { IsolateKeys, KeyToMinified, MinifiedToKey } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';

export class IsolateSerializer {
  // eslint-disable-next-line max-statements, complexity
  static deserialize(node: Record<string, any> | TIsolate | string): TIsolate {
    // the  assumption is that the tree is built correctly,
    // but the children are missing the parent property to
    // avoid circular references during serialization.
    // in the same way, the parents are missing the `keys` property
    // to avoid circular references during serialization.
    // we need to rebuild the tree and add back the parent property to the children
    // and the keys property to the parents.

    const root = isStringValue(node)
      ? JSON.parse(node)
      : ({ ...node } as TIsolate);

    IsolateSerializer.validateIsolate(root);

    const queue = [root];

    while (queue.length) {
      const current = queue.shift();

      const children = IsolateSerializer.getChildren(current);

      for (const key in MinifiedToKey) {
        const value = current[key];
        if (isNotNullish(value)) {
          current[MinifiedToKey[key]] = value;
          delete current[key];
        }
      }

      if (!children) {
        continue;
      }

      current.children = children.map(child => {
        const nextChild = { ...child };

        IsolateMutator.setParent(nextChild, current);
        queue.push(nextChild);

        const key = nextChild.key;

        if (key) {
          current.keys = current.keys ?? {};
          current.keys[key] = nextChild;
        }

        return nextChild;
      });
    }

    return root as TIsolate;
  }

  static serialize(isolate: Nullable<TIsolate>): string {
    if (isNullish(isolate)) {
      return '';
    }

    return JSON.stringify(transformIsolate(isolate));
  }

  static getChildren(node: TIsolate): Nullable<TIsolate[]> {
    return node.children ? [...node.children] : null;
  }

  static validateIsolate(node: Record<string, any> | TIsolate): void {
    invariant(
      hasOwnProperty(node, IsolateKeys.Type) ||
        hasOwnProperty(node, KeyToMinified[IsolateKeys.Type]),
      text(ErrorStrings.IVALID_ISOLATE_CANNOT_PARSE)
    );
  }
}

// eslint-disable-next-line max-statements, complexity
function transformIsolate(isolate: TIsolate): Record<string, any> {
  const next: Record<string, any> = {};

  if (isolate.children) {
    next.children = isolate.children.map(transformIsolate);
  }

  for (const key in isolate) {
    if (key === 'children') {
      continue;
    }

    if (isKeyExcluededFromDump(key)) {
      continue;
    }
    const value = isolate[key as keyof TIsolate];

    if (isNullish(value)) {
      continue;
    }

    if (hasOwnProperty(KeyToMinified, key)) {
      next[KeyToMinified[key]] = value;
    } else {
      next[key] = value;
    }
  }

  return next;
}

function isKeyExcluededFromDump(key: string): boolean {
  return [IsolateKeys.Parent, IsolateKeys.Keys].includes(key as IsolateKeys);
}

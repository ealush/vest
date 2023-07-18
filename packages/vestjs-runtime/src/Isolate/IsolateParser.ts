import { ErrorStrings } from 'ErrorStrings';
import {
  Nullable,
  hasOwnProperty,
  invariant,
  isStringValue,
  text,
} from 'vest-utils';

import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';

export class IsolateParser {
  // eslint-disable-next-line max-statements, complexity
  static parse(node: Record<string, any> | TIsolate): TIsolate {
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

    IsolateParser.validateIsolate(root);

    const queue = [root];

    while (queue.length) {
      const current = queue.shift() as TIsolate;

      const children = IsolateParser.getChildren(current);

      if (!children) {
        continue;
      }

      for (const child of children) {
        IsolateMutator.setParent(child, current);
        queue.push(child);

        const key = child.key;

        if (key) {
          current.keys = current.keys ?? {};
          current.keys[key] = child;
        }
      }
    }

    return root;
  }

  static getChildren(node: TIsolate): Nullable<TIsolate[]> {
    return node.children ? [...node.children] : null;
  }

  static validateIsolate(node: Record<string, any> | TIsolate): void {
    invariant(
      hasOwnProperty(node, IsolateKeys.Type),
      text(ErrorStrings.IVALID_ISOLATE_CANNOT_PARSE)
    );
  }
}

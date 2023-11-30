import { ErrorStrings } from 'ErrorStrings';
import {
  Maybe,
  Nullable,
  hasOwnProperty,
  invariant,
  isEmpty,
  isNotNullish,
  isNullish,
  isStringValue,
  text,
} from 'vest-utils';

import { TIsolate } from 'Isolate';
import {
  ExcludedFromDump,
  IsolateKeys,
  KeyToMinified,
  MinifiedKeys,
  MinifiedToKey,
  invertKeyMap,
} from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';

export class IsolateSerializer {
  // eslint-disable-next-line max-statements, complexity
  static deserialize(
    node: Record<string, any> | TIsolate | string,
    miniMaps: Maybe<MiniMaps>
  ): TIsolate {
    // the  assumption is that the tree is built correctly,
    // but the children are missing the parent property to
    // avoid circular references during serialization.
    // in the same way, the parents are missing the `keys` property
    // to avoid circular references during serialization.
    // we need to rebuild the tree and add back the parent property to the children
    // and the keys property to the parents.
    const inverseMinimap = invertKeyMap(miniMaps?.keys?.data);

    // Validate the root object
    const root = isStringValue(node)
      ? JSON.parse(node)
      : ({ ...node } as TIsolate);

    IsolateSerializer.validateIsolate(root);

    const queue = [root];

    // Iterate over the queue until it's empty
    while (queue.length) {
      // Get the next item from the queue
      const current = queue.shift();

      // Get the children of the current item
      const children = IsolateSerializer.expandChildren(current);

      // Iterate over the minified keys
      for (const key in MinifiedToKey) {
        // Get the value for the current key
        const value = current[key];

        // If the value is not null or undefined
        if (isNotNullish(value)) {
          // Get the key to use
          const keyToUse = MinifiedToKey[key];

          // If the key is data, then we may need to transform the keys
          if (keyToUse === IsolateKeys.Data) {
            // Transform the keys
            current[keyToUse] = transformKeys(value, inverseMinimap);
          } else {
            // Otherwise, just set the key
            current[keyToUse] = value;
          }

          // Remove the old key
          delete current[key];
        }
      }

      // If there are no children, nothing to do.
      if (!children) {
        continue;
      }

      // Copy the children and set their parent to the current node.
      current.children = children.map(child => {
        const nextChild = { ...child };

        IsolateMutator.setParent(nextChild, current);
        queue.push(nextChild);

        // If the child has a key, add it to the parent's keys.
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

  static serialize(
    isolate: Nullable<TIsolate>,
    miniMaps: Maybe<MiniMaps>
  ): string {
    if (isNullish(isolate)) {
      return '';
    }

    return JSON.stringify(transformIsolate(isolate, miniMaps));
  }

  static expandChildren(node: Record<string, any>): Nullable<TIsolate[]> {
    return node[MinifiedKeys.Children]
      ? [...node[MinifiedKeys.Children]]
      : null;
  }

  static validateIsolate(node: Record<string, any> | TIsolate): void {
    invariant(
      hasOwnProperty(node, IsolateKeys.Type) ||
        hasOwnProperty(node, KeyToMinified[IsolateKeys.Type]),
      text(ErrorStrings.INVALID_ISOLATE_CANNOT_PARSE)
    );
  }
}

// eslint-disable-next-line max-statements, complexity
function transformIsolate(
  isolate: TIsolate,
  miniMaps: Maybe<MiniMaps>
): Record<string, any> {
  const next: Record<string, any> = {};

  if (isolate.children) {
    next[MinifiedKeys.Children] = isolate.children.map(isolate =>
      transformIsolate(isolate, miniMaps)
    );
  }

  if (!isEmpty(isolate.data)) {
    next[MinifiedKeys.Data] = transformKeys(isolate.data, miniMaps?.keys?.data);
  }

  for (const key in isolate) {
    // Skip keys that should be excluded from the dump.
    // While we're excluding children from the dump, they'll actually remain there
    // due to the fact that we've already transformed them recursively beforehand
    // thus renaming them to the minified key.
    if (isKeyExcluededFromDump(key)) {
      continue;
    }
    const value = isolate[key as keyof TIsolate];

    if (isNullish(value)) {
      continue;
    }

    const keyToUse = minifyKey(key);
    next[keyToUse] = minifyValueByKey(key, value, miniMaps);
  }

  return next;
}

function isKeyExcluededFromDump(key: string): boolean {
  return ExcludedFromDump.includes(key as IsolateKeys);
}

function minifyKey(key: string): string {
  return KeyToMinified[key as keyof typeof KeyToMinified] ?? key;
}

function minifyValueByKey(
  key: string,
  value: any,
  miniMaps: Maybe<MiniMaps>
): any {
  if (isNullish(value)) {
    return value;
  }

  const keyMap = miniMaps?.values?.[key as keyof MiniMaps['values']];

  return keyMap ? keyMap[value] ?? value : value;
}

function transformKeys(
  data: Record<string, any>,
  keyMap: Maybe<MiniMap>
): Record<string, any> {
  const next: Record<string, any> = {};

  // Loop over each key in the data.
  for (const key in data) {
    // Find the key to use for the next object.
    // If there is no key map, use the original key.
    // If there is a key map, use the key map entry for the current key.
    const keyToUse = (keyMap ? keyMap[key] : key) ?? key;

    // Add the key and value to the next object.
    next[keyToUse] = data[key];
  }

  // Return the next object.
  return next;
}

type MiniMap = Record<string, string>;

type MiniMaps = Partial<{
  keys: Partial<{
    [IsolateKeys.Data]: MiniMap;
  }>;
  values: Partial<{
    [IsolateKeys.Status]: MiniMap;
    [IsolateKeys.Type]: MiniMap;
  }>;
}>;

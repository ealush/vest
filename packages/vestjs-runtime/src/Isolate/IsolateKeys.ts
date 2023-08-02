export enum IsolateKeys {
  Type = '$type',
  Keys = 'keys',
  Key = 'key',
  Parent = 'parent',
  Data = 'data',
  AllowReorder = 'allowReorder',
}

export const KeyToMinified = {
  [IsolateKeys.Type]: '$',
  [IsolateKeys.Keys]: 'K',
  [IsolateKeys.Parent]: 'P',
};

// This const is an object that looks like this:
// {
//   '$': '$type',
//   'K': 'keys',
//   'P': 'parent',
//   ...
// }
export const MinifiedToKey = Object.keys(IsolateKeys).reduce(
  (acc, key: string) =>
    Object.assign(acc, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - let's ignore for now
      [KeyToMinified[IsolateKeys[key]]]: IsolateKeys[key],
    }),
  {} as Record<string, IsolateKeys>
);

export enum IsolateKeys {
  Type = '$type',
  Keys = 'keys',
  Parent = 'parent',
}

export const KeyToMinified = {
  [IsolateKeys.Type]: '$',
  [IsolateKeys.Keys]: 'K',
  [IsolateKeys.Parent]: 'P',
};

export const MinifiedToKey = Object.keys(IsolateKeys).reduce(
  (acc, key: string) =>
    Object.assign(acc, {
      // @ts-ignore - Let's have copilot fix this when I am online
      [KeyToMinified[IsolateKeys[key]]]: IsolateKeys[key],
    }),
  {} as Record<string, IsolateKeys>
);

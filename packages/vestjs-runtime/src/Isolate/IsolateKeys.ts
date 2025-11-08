export enum IsolateKeys {
  Type = '$type',
  Keys = 'keys',
  Key = 'key',
  Parent = 'parent',
  Data = 'data',
  AllowReorder = 'allowReorder',
  Status = 'status',
  AbortController = 'abortController',
  Children = 'children',
}

export const ExcludedFromDump = new Set([
  IsolateKeys.AbortController,
  IsolateKeys.Parent,
  IsolateKeys.Keys,
]);

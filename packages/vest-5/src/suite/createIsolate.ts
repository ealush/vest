export function createIsolate(
  type: IsolateTypes = IsolateTypes.DEFAULT
): Isolate {
  return {
    type,
    cursor: 0,
    children: [],
  };
}

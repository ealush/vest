export function createIsolateCursor(): IsolateCursor {
  const cursor = {
    value: 0,
  };

  return {
    current,
    next,
  };

  function current(): number {
    return cursor.value;
  }

  function next(): number {
    cursor.value++;
    return cursor.value;
  }
}

export type IsolateCursor = {
  current: () => number;
  next: () => number;
};

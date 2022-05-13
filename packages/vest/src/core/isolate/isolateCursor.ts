export function createIsolateCursor(): IsolateCursor {
  const cursor = {
    value: 0,
  };

  return {
    current,
    next,
  };

  /**
   * @returns {number} The current value of the cursor
   */
  function current(): number {
    return cursor.value;
  }

  /**
   * Moves the isolate cursor forward by 1
   */
  function next(): void {
    cursor.value++;
  }
}

export type IsolateCursor = {
  current: () => number;
  next: () => void;
};

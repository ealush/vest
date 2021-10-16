import asArray from 'asArray';
import last from 'last';

export function createCursor() {
  const storage: { cursor: number[] } = {
    cursor: [],
  };

  function addLevel(): void {
    storage.cursor.push(0);
  }

  function removeLevel(): void {
    storage.cursor.pop();
  }

  function cursorAt(): number {
    return last(storage.cursor);
  }

  function getCursor(): number[] {
    return asArray(storage.cursor);
  }

  function next(): number {
    storage.cursor[storage.cursor.length - 1]++;
    return last(storage.cursor);
  }

  function reset(): void {
    storage.cursor = [0];
  }

  reset();

  return {
    addLevel,
    cursorAt,
    getCursor,
    next,
    removeLevel,
    reset,
  };
}

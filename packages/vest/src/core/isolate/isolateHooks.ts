import { Isolate } from 'IsolateTypes';
import ctx from 'ctx';
import { IsolateCursor } from 'isolateCursor';

/**
 * @returns {Isolate} The current isolate layer
 */
export function useIsolate(): Isolate {
  return ctx.useX().isolate;
}
/**
 * @returns {number[]} The current cursor path of the isolate tree
 */
export function useCurrentPath(): number[] {
  const isolate = useIsolate();
  return isolate.path.concat(isolate.cursor.current());
}

/**
 * @returns {IsolateCursor} The cursor object for the current isolate
 */
export function useCursor(): IsolateCursor {
  return useIsolate().cursor;
}

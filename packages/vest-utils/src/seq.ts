/**
 * @returns a unique numeric id.
 */

import { CB } from 'utilityTypes';

const seq = genSeq();

export default seq;

export function genSeq(namespace?: string): CB<string> {
  return (
    (n: number) => () =>
      `${namespace ? namespace + '_' : ''}${n++}`
  )(0);
}

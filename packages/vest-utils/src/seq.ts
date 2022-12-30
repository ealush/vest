/**
 * @returns a unique numeric id.
 */

const seq = genSeq();

export default seq;

export function genSeq(namespace?: string): () => string {
  return (
    (n: number) => () =>
      `${namespace ? namespace + '_' : ''}${n++}`
  )(0);
}

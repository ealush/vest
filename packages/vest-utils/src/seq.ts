/**
 * @returns a unique numeric id.
 */

const seq: () => string = (
  (n: number) => (): string =>
    `${n++}`
)(0);

export default seq;

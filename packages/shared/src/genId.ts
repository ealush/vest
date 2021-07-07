/**
 * @returns a unique numeric id.
 */

const genId: () => string = (
  (n: number) => (): string =>
    `${n++}`
)(0);

export default genId;

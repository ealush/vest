/**
 * @returns a unique numeric id.
 */

const id = (n => () => `${n++}`)(0);

export default id;

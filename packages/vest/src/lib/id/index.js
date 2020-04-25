import singleton from '../singleton';

const SYMBOL_ID = Symbol('vestId');

/**
 * @returns a unique numeric id.
 */
const id = () => {
  const id = singleton.use()[SYMBOL_ID] ?? 0;
  singleton.set(SYMBOL_ID, id + 1);
  return id.toString();
};

export default id;

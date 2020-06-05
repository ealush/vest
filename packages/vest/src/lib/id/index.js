import singleton from '../singleton';

const KEY_ID = 'vestId';

/**
 * @returns a unique numeric id.
 */
const id = () => {
  const id = singleton.use()[KEY_ID] ?? 0;
  singleton.set(KEY_ID, id + 1);
  return id.toString();
};

export default id;

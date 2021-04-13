export default function expandStateRef(stateRef) {
  const state = {};
  for (const key in stateRef) {
    const [value] = stateRef[key]();
    state[key] = value;
  }
  return state;
}

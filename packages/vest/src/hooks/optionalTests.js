import asArray from 'asArray';
import { useOptionalFields } from 'stateHooks';

export default function optional(optionals) {
  const [, setOptionalFields] = useOptionalFields();

  setOptionalFields(state => {
    asArray(optionals).forEach(optionalField => {
      state[optionalField] = true;
    });

    return state;
  });
}

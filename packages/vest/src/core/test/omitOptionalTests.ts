import assign from 'assign';
import { isEmpty } from 'isEmpty';
import isFunction from 'isFunction';

import VestTest from 'VestTest';
import {
  useTestObjects,
  useOptionalFields,
  useOmittedFields,
} from 'stateHooks';

export default function omitOptionalTests(): void {
  const [testObjects] = useTestObjects();
  const [optionalFields] = useOptionalFields();
  const [, setOmittedFields] = useOmittedFields();

  if (isEmpty(optionalFields)) {
    return;
  }

  const shouldOmit: Record<string, boolean> = {};

  testObjects.forEach(testObject => {
    const fieldName = testObject.fieldName;

    if (shouldOmit.hasOwnProperty(fieldName)) {
      omit(testObject);
    }

    const optionalConfig = optionalFields[fieldName];
    if (isFunction(optionalConfig)) {
      shouldOmit[fieldName] = optionalConfig();

      omit(testObject);
    }
  });

  function omit(testObject: VestTest) {
    if (shouldOmit[testObject.fieldName]) {
      testObject.omit();
      setOmittedFields(omittedFields =>
        assign(omittedFields, { [testObject.fieldName]: true })
      );
    }
  }
}

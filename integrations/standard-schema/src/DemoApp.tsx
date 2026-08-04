import { useState } from 'react';

import { validateJson, validators } from './integration';
import type { ValidationDisplay } from './integration';
import './styles.css';

const initialJson = JSON.stringify(
  {
    email: '  DEV@EXAMPLE.COM  ',
    profile: { age: '42', name: '  Ada  ' },
  },
  null,
  2,
);

export default function DemoApp() {
  const [validatorName, setValidatorName] =
    useState<keyof typeof validators>('Vest suite');
  const [source, setSource] = useState(initialJson);
  const [result, setResult] = useState<ValidationDisplay>();

  async function runValidation() {
    setResult(await validateJson(validators[validatorName], source));
  }

  return (
    <main>
      <p className="eyebrow">Standard Schema example</p>
      <h1>Standard Schema playground</h1>
      <p>
        Validate the same JSON through a Vest suite or an Enforce schema. The
        normalized result is exactly what a Standard Schema consumer receives.
      </p>

      <label>
        Validator
        <select
          value={validatorName}
          onChange={event =>
            setValidatorName(event.target.value as keyof typeof validators)
          }
        >
          {Object.keys(validators).map(name => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>

      <label>
        JSON input
        <textarea
          value={source}
          onChange={event => setSource(event.target.value)}
          rows={11}
        />
      </label>

      <button type="button" onClick={runValidation}>
        Validate
      </button>

      <pre aria-live="polite">
        {result
          ? JSON.stringify(result, null, 2)
          : 'Run validation to inspect the normalized result.'}
      </pre>
    </main>
  );
}

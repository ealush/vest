import { useState } from 'react';

import { requestAccount } from './app';
import './styles.css';

const initial = JSON.stringify(
  { email: '  DEV@EXAMPLE.COM  ', profile: { age: '42' } },
  null,
  2,
);

export default function DemoApp() {
  const [source, setSource] = useState(initial);
  const [result, setResult] = useState(
    'Send a request to inspect the response.',
  );
  return (
    <main>
      <p className="eyebrow">Hono request validation</p>
      <h1>Vest with Hono</h1>
      <p>A real in-memory Hono request is validated before its handler runs.</p>
      <label htmlFor="account-json">Account request JSON</label>
      <textarea
        id="account-json"
        rows={9}
        value={source}
        onChange={e => setSource(e.target.value)}
      />
      <button
        type="button"
        onClick={async () => {
          try {
            setResult(
              JSON.stringify(await requestAccount(JSON.parse(source)), null, 2),
            );
          } catch {
            setResult('Input is not valid JSON.');
          }
        }}
      >
        POST /accounts
      </button>
      <pre>{result}</pre>
    </main>
  );
}

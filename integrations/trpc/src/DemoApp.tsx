import { useState } from 'react';

import { createAccount } from './router';
import './styles.css';

const initialJson = JSON.stringify(
  { email: '  DEV@EXAMPLE.COM  ', profile: { age: '42' } },
  null,
  2,
);

export default function DemoApp() {
  const [input, setInput] = useState(initialJson);
  const [output, setOutput] = useState('Run the tRPC procedure.');

  async function run() {
    try {
      setOutput(
        JSON.stringify(await createAccount(JSON.parse(input)), null, 2),
      );
    } catch (error) {
      setOutput(JSON.stringify((error as { cause?: unknown }).cause, null, 2));
    }
  }

  return (
    <main>
      <h1>Vest + tRPC</h1>
      <p>A real tRPC procedure accepts the Vest suite as its input parser.</p>
      <textarea
        value={input}
        onChange={event => setInput(event.target.value)}
      />
      <button type="button" onClick={run}>
        Run procedure
      </button>
      <pre>{output}</pre>
    </main>
  );
}

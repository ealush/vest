import { useState } from 'react';

import { parseEnvironment } from './env';
import './styles.css';

const initialJson = JSON.stringify(
  {
    API_URL: 'https://vestjs.dev',
    PORT: '3000',
    PUBLIC_APP_NAME: '  Vest demo  ',
  },
  null,
  2,
);

export default function DemoApp() {
  const [input, setInput] = useState(initialJson);
  const [output, setOutput] = useState('Validate the environment.');

  function run() {
    try {
      setOutput(JSON.stringify(parseEnvironment(JSON.parse(input)), null, 2));
    } catch (error) {
      setOutput(String(error));
    }
  }

  return (
    <main>
      <h1>Vest + T3 Env</h1>
      <p>Vest Enforce schemas validate and coerce individual variables.</p>
      <textarea
        value={input}
        onChange={event => setInput(event.target.value)}
      />
      <button type="button" onClick={run}>
        Validate environment
      </button>
      <pre>{output}</pre>
    </main>
  );
}

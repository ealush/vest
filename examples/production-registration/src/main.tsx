import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { RegistrationForm } from './RegistrationForm';
import { createRegistrationSuite } from './registrationSuite';
import './styles.css';

const demoSuite = createRegistrationSuite({
  async isUsernameAvailable(username, signal) {
    await wait(650, signal);
    return !['admin', 'root', 'taken'].includes(username.trim().toLowerCase());
  },
});

function wait(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, delayMs);

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">Runnable reference architecture</p>
        <h1>Production registration with Vest</h1>
        <p>
          React Hook Form owns inputs, Vest owns progressive validation state,
          and Zod protects the submitted boundary. Try <code>taken</code> to see
          the async username rule.
        </p>
      </section>
      <section className="form-card">
        <RegistrationForm
          suite={demoSuite}
          onRegister={async () => {
            await new Promise(resolve => window.setTimeout(resolve, 450));
            return { ok: true };
          }}
        />
      </section>
    </main>
  </StrictMode>,
);

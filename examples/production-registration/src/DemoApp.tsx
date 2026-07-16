import { useEffect, useState } from 'react';

import { RegistrationForm } from './RegistrationForm';
import { createRegistrationSuite } from './registrationSuite';
import './styles.css';

function wait(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

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

function createDemoSuite() {
  return createRegistrationSuite({
    async isUsernameAvailable(username, signal) {
      await wait(650, signal);
      return !['admin', 'root', 'taken'].includes(
        username.trim().toLowerCase(),
      );
    },
  });
}

export default function DemoApp() {
  const [demoSuite] = useState(createDemoSuite);

  useEffect(() => () => demoSuite.reset(), [demoSuite]);

  return (
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">Runnable reference architecture</p>
        <h1>Production registration with Vest</h1>
        <p>
          React Hook Form owns inputs, Vest owns progressive validation state,
          and this version uses Zod at the submitted boundary. Enforce schemas
          can own that boundary too. Try <code>taken</code> to see the async
          username rule.
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
  );
}

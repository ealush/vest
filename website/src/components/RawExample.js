import React from 'react';
import Sandpack from './Sandpack';
import styles from './RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from 'vest';
import { memo } from 'vest/memo';
import { checkUsername } from './api';

const suite = create((data = {}) => {
  test("username", "Username is required", () => {
    enforce(data.username).isNotBlank();
  });

  test("username", "Username must be at least 3 chars", () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  memo(() => {
    test('username', 'Username already taken', async ({ signal }) => {
      const { available } = await checkUsername(data.username, { signal });
      enforce(available).isTruthy();
    });
  }, [data.username]);
});

export default suite;
`;

const ApiCode = `export async function checkUsername(username, { signal } = {}) {
  await new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = setTimeout(resolve, 1000);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });

  return {
    available: !username?.toLowerCase().includes('taken'),
  };
}
`;

const AppCode = `import React, { useState } from "react";
import suite from "./suite";
import "./styles.css";

export default function App() {
  const [form, setForm] = useState({});
  const [, setIsPending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    
    suite
      .only(name)
      .afterEach(() => {
        setIsPending(suite.isPending());
      })
      .run(newForm);
  };

  return (
    <div className="App">
      <h1>Vest Example</h1>
      <div className="form-group">
        <label>
          Username:
        </label>
        <div className="input-container">
        <input 
          name="username"
          value={form.username || ""} 
          onChange={handleChange}
          placeholder="Try 'taken' to see async error"
        />
        {suite.isPending("username") && <span className="spinner" />}
        </div>
        {suite.hasErrors("username") && (
          <div className="error">
            {suite.getError("username")}
          </div>
        )}
      </div>
      
      <div className="info">
        <p>Type <strong>taken</strong> to trigger async error.</p>
        <p>Type less than 3 chars for length error.</p>
      </div>
    </div>
  );
}
`;

const StylesCode = `body {
  font-family: sans-serif;
  background: #14161a;
  color: #fff;
}

.App {
  padding: 20px;
}

h1 {
  margin-top: 0;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #222;
  color: #fff;
  font-size: 1rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #444;
  border-top-color: #61dafb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 10px;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

input:focus {
  outline: none;
  border-color: #61dafb;
}

.error {
  color: #ff5f56;
  font-size: 0.9rem;
  margin-top: 5px;
}

.info {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #888;
  border-top: 1px solid #333;
  padding-top: 10px;
}
`;

export default function RawExample() {
  return (
    <section className={styles.section}>
      <div className={styles.desc}>
        <span className={styles.kicker}>THE SUITE / 02</span>
        <strong>Rules read like tests. State lives outside the UI.</strong>
        <p>
          Your suite contains the business rules. Vest manages how their truth
          changes over time: focused runs, retained results, pending work, and
          stale async responses.
        </p>
      </div>
      <div className={styles.codeWindow}>
        <Sandpack
          template="react"
          theme="dark"
          files={{
            '/suite.js': SuiteCode,
            '/App.js': AppCode,
            '/styles.css': StylesCode,
            '/api.js': ApiCode,
          }}
          customSetup={{
            dependencies: {
              vest: '^6.3.2',
            },
          }}
          options={{
            activeFile: '/suite.js',
            showCommonFiles: false,
            visibleFiles: ['/suite.js', '/App.js'],
          }}
        />
      </div>
    </section>
  );
}

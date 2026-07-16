import React from 'react';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce, mode, Modes } from 'vest';

export const createSignupSuite = selectedMode =>
  create((data = {}) => {
    // Mode defines how tests act when encountering a failure:
    // EAGER - Stop validating this field after the first failure.
    // ALL   - Gather all errors for each field.
    // ONE   - Stop validating the entire suite after any error.
    mode(selectedMode);

    test('email', 'Email is required', () => {
      enforce(data.email).isNotBlank();
    });

    test('email', 'Email must be from company domain', () => {
      enforce(data.email).endsWith('@company.com');
    });

    test('password', 'Password must be at least 8 chars', () => {
      enforce(data.password).longerThanOrEquals(8);
    });

    test('password', 'Password must include a number', () => {
      enforce(data.password).matches(/[0-9]/);
    });
  });

export { Modes };
`;

const AppCode = `import React, { useMemo, useState } from 'react';
import { createSignupSuite, Modes } from './suite';
import './styles.css';

export default function App() {
  const [selectedMode, setSelectedMode] = useState(Modes.EAGER);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const suite = useMemo(() => createSignupSuite(selectedMode), [selectedMode]);
  const result = suite.run(form);

  return (
    <div className="App">
      <h3>Execution Modes playground</h3>

      <div className="modeButtons">
        {Object.values(Modes).map(modeName => (
          <button
            key={modeName}
            className={selectedMode === modeName ? 'active' : ''}
            onClick={() => setSelectedMode(modeName)}
          >
            {modeName}
          </button>
        ))}
      </div>

      <label>Email</label>
      <input
        value={form.email}
        onChange={e => setForm(current => ({ ...current, email: e.target.value }))}
        placeholder="name@gmail.com"
      />
      <p className={result.hasErrors('email') ? 'status error' : 'status ok'}>{result.getErrors('email').join(' · ') || 'No email errors'}</p>

      <label>Password</label>
      <input
        value={form.password}
        onChange={e => setForm(current => ({ ...current, password: e.target.value }))}
        placeholder="short"
      />
      <p className={result.hasErrors('password') ? 'status error' : 'status ok'}>{result.getErrors('password').join(' · ') || 'No password errors'}</p>

      <p className="caption">
        Eager returns first failure per field, All returns all failures, and One stops after the first failure in the whole run.
      </p>
    </div>
  );
}
`;

const StylesCode = `body {
  background: #111;
  color: #e6edf3;
  font-family: Inter, sans-serif;
}
.App {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px;
}
.modeButtons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
button {
  border: 1px solid #30363d;
  background: #161b22;
  color: #e6edf3;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}
button.active {
  border-color: #2f81f7;
  color: #2f81f7;
}
input {
  width: 100%;
  margin-top: 4px;
  margin-bottom: 6px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px;
  color: #e6edf3;
}
label {
  display: block;
  margin-top: 12px;
}
.status {
  min-height: 20px;
  margin: 0;
}
.error {
  color: #f85149;
}
.ok {
  color: #3fb950;
}
.caption {
  margin-top: 16px;
  color: #8b949e;
}
`;

export default function ExecutionModesSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react"
        theme="dark"
        files={{
          '/suite.js': SuiteCode,
          '/App.js': AppCode,
          '/styles.css': StylesCode,
        }}
        customSetup={{
          dependencies: {
            vest: '^6.3.2',
          },
        }}
        options={{
          activeFile: '/App.js',
          showCommonFiles: false,
          visibleFiles: ['/App.js', '/suite.js'],
          editorHeight: 640,
        }}
      />
    </div>
  );
}

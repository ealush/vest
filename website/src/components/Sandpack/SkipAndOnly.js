import React from 'react';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce, skip, only } from 'vest';

const suite = create((data = {}, currentField) => {
  // Validate only the changed field if a \`currentField\` is provided.
  // This is a great way to handle "onChange" updates so that other untouched fields
  // are not validated until the user interacts with the form.
  only(currentField);

  // Skip the "promo" field tests entirely if the user hasn't entered anything yet.
  // This causes the promo code to be considered completely valid when it's left blank.
  skip(!data.promo && 'promo');

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('promo', 'Promo code must be 6 chars', () => {
    enforce(data.promo).lengthEquals(6);
  });
});

export default suite;
`;

const AppCode = `import React, { useState } from 'react';
import suite from './suite';
import './styles.css';

export default function App() {
  const [form, setForm] = useState({ email: '', password: '', promo: '' });
  const [result, setResult] = useState(suite.get());

  const onChange = e => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setResult(suite.run(next, name));
  };

  return (
    <div className="App">
      <h3>skip() + only() in a checkout flow</h3>
      {['email', 'password', 'promo'].map(field => (
        <div key={field} className="field">
          <label>{field}</label>
          <input
            name={field}
            value={form[field]}
            onChange={onChange}
            placeholder={field === 'promo' ? 'optional' : ''}
          />
          <small className={result.hasErrors(field) ? 'error' : 'ok'}>{result.getErrors(field).join(', ') || 'No errors'}</small>
        </div>
      ))}
      <p>
        Promo is ignored when empty, so the form can still be valid without touching it.
      </p>
    </div>
  );
}
`;

const StylesCode = `body { background: #0f1115; color: #fff; font-family: Inter, sans-serif; }
.App { max-width: 560px; margin: 0 auto; padding: 20px; }
.field { margin: 10px 0; }
label { display: block; margin-bottom: 4px; text-transform: capitalize; }
input { width: 100%; background: #181c24; color: #fff; border: 1px solid #2f3440; border-radius: 6px; padding: 8px; }
small { display: block; margin-top: 6px; min-height: 18px; }
.error { color: #ff8e8e; }
.ok { color: #3fb950; }
p { color: #9aa4b2; }
`;

export default function SkipAndOnlySandpack() {
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
          editorHeight: 620,
        }}
      />
    </div>
  );
}

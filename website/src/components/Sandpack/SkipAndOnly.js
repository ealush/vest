import React from 'react';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce, skip, only } from 'vest';

const suite = create((data = {}, currentField) => {
  // Validate only the changed field in an interactive form.
  only(currentField);

  // Skip promo checks when promo is blank.
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
    setResult(suite(next, name));
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
          <small>{result.getErrors(field).join(', ') || 'No errors'}</small>
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
small { color: #ff8e8e; display: block; margin-top: 6px; min-height: 18px; }
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
            vest: 'next',
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

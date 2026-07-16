import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from 'vest';
import 'vest/email';

const suite = create((data = {}) => {
  // \`test\` runs an assertion. The first argument is the name of the field.
  test('username', 'Username is required', () => {
    // \`enforce\` checks that a condition is met. 
    // If it throws an error, the test is marked as failed.
    enforce(data.username).isNotBlank();
  });
  
  // You can define multiple tests for the same field.
  test('username', 'Must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('email', 'Invalid email format', () => {
    enforce(data.email).isEmail();
  });
});

export default suite;
`;

const AppCode = `import React, { useState } from "react";
import suite from "./suite";
import FormLayout from "./FormLayout";
import "./styles.css";

export default function App() {
  const [form, setForm] = useState({});
  const [res, setRes] = useState(suite.get());

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 1. Update form
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    
    // 2. Focused Update: Validate ONLY the changed field
    suite.only(name).run(newForm);
    
    // Update result
    setRes(suite.get());
  };

  const handleValidateAll = () => {
    // Run full validation
    suite.run(form);
    setRes(suite.get());
  };

  return (
    <FormLayout 
      form={form} 
      onChange={handleChange} 
      onValidateAll={handleValidateAll}
      res={res} // Passed for structure, but layout uses suite directly
    />
  );
}
`;

const FormLayoutCode = `import React from "react";
import suite from "./suite";

export default function FormLayout({ form, onChange, onValidateAll }) {
  // Using suite directly for safe property access
  const result = suite.get();

  return (
    <div className="App">
      <h3>Focused Updates Demo</h3>
      
      <div className="form-group">
        <label>Username (Type to focus validate):</label>
        <input 
          name="username"
          value={form.username || ""} 
          onChange={onChange}
          className={suite.hasErrors('username') ? 'invalid' : ''}
        />
        {suite.hasErrors('username') && (
          <div className="error">{suite.getError('username')}</div>
        )}
      </div>

      <div className="form-group">
        <label>Email (Type to focus validate):</label>
        <input 
          name="email"
          value={form.email || ""} 
          onChange={onChange}
          className={suite.hasErrors('email') ? 'invalid' : ''}
        />
        {suite.hasErrors('email') && (
          <div className="error">{suite.getError('email')}</div>
        )}
      </div>

      <div className="actions">
        <button className="validate-all" onClick={onValidateAll}>
          Validate All Fields
        </button>
      </div>

      <div className="status">
        <strong>Tested Fields:</strong> {result.testedCount} <br/>
        <strong>Error Count:</strong> {result.errorCount}
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
.App { padding: 20px; }
h3 { margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 15px; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9rem; color: #aaa; }
input {
  width: 100%; box-sizing: border-box;
  padding: 8px; border-radius: 4px; border: 1px solid #444;
  background: #222; color: #fff; font-size: 1rem;
}
input.invalid { border-color: #ff5f56; }
input:focus { outline: none; border-color: #61dafb; }
.error { color: #ff5f56; font-size: 0.85rem; margin-top: 4px; }
.actions { text-align: center; margin-top: 25px; }
.validate-all {
  background: #61dafb; border: none; padding: 10px 20px;
  border-radius: 4px; font-weight: bold; cursor: pointer; color: #14161a;
}
.validate-all:hover { background: #4ad0f7; }
.status { 
  margin-top: 20px; border-top: 1px solid #333; padding-top: 15px; 
  color: #888; font-size: 0.9rem; font-family: monospace; 
}
.status strong { color: #fff; }
`;

export default function FocusedUpdatesSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react"
        theme="dark"
        files={{
          '/suite.js': SuiteCode,
          '/App.js': AppCode,
          '/FormLayout.js': FormLayoutCode,
          '/styles.css': StylesCode,
        }}
        customSetup={{
          dependencies: {
            vest: 'latest',
          },
        }}
        options={{
          activeFile: '/App.js',
          showCommonFiles: false,
          visibleFiles: ['/App.js', '/suite.js'],
          editorHeight: 600,
        }}
      />
    </div>
  );
}

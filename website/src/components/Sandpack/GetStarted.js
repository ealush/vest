import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  // \`test\` runs an assertion. The first argument is the name of the field.
  test('username', 'Username is required', () => {
    // \`enforce\` checks that a condition is met. 
    // If it throws an error, the test is marked as failed.
    enforce(data.username).isNotBlank();
  });

  // You can define multiple tests for the same field.
  test('username', 'Username must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });

  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
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
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    
    // Run the validation
    const result = suite.only(name).run(newForm);
    setRes(result);
  };

  return (
    <FormLayout 
      form={form} 
      onChange={handleChange} 
      res={res} 
    />
  );
}
`;

const FormLayoutCode = `import React from "react";

export default function FormLayout({ form, onChange, res }) {
  return (
    <div className="App">
      <h1>Vest Getting Started</h1>
      
      <div className="form-group">
        <label>Username:</label>
        <input 
          name="username"
          value={form.username || ""} 
          onChange={onChange}
          className={res.hasErrors('username') ? 'invalid' : ''}
        />
        {res.hasErrors('username') && (
          <div className="error">{res.getError('username')}</div>
        )}
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input 
          name="password" 
          type="password"
          value={form.password || ""} 
          onChange={onChange}
          className={res.hasErrors('password') ? 'invalid' : ''}
        />
        {res.hasErrors('password') && (
          <div className="error">{res.getError('password')}</div>
        )}
      </div>
      
      <div className="status">
        Example Status: {res.isValid() ? '✅ Valid' : '❌ Invalid'}
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
h1 { font-size: 1.2rem; margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9rem;}
input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #222;
  color: #fff;
  font-size: 1rem;
}
input.invalid { border-color: #ff5f56; }
input:focus { outline: none; border-color: #61dafb; }
.error { color: #ff5f56; font-size: 0.85rem; margin-top: 4px; }
.status {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #333;
  color: #888;
  font-size: 0.9rem;
}
`;

export default function GetStartedSandpack() {
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
            vest: '^6.3.2',
          },
        }}
        options={{
          activeFile: '/suite.js',
          showCommonFiles: false,
          visibleFiles: ['/suite.js', '/App.js'],
          editorHeight: 600,
        }}
      />
    </div>
  );
}

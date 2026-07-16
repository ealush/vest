import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from 'vest';
import 'vest/email';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });
  
  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('email', 'Invalid email format', () => {
    enforce(data.email).isEmail();
  });

  test('password', 'Password is weak', () => {
    enforce(data.password).longerThan(5);
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
  // 1. Get initial result
  const [res, setRes] = useState(suite.get());

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    
    // 2. Validate specific field
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
      <div className="form-container">
        <h3>Form</h3>
        <label>Username</label>
        <input name="username" onChange={onChange} value={form.username || ""} />
        
        <label>Email</label>
        <input name="email" onChange={onChange} value={form.email || ""} />
        
        <label>Password</label>
        <input name="password" type="password" onChange={onChange} value={form.password || ""} />
      </div>

      <div className="result-container">
        <h3>Result Inspector</h3>
        <div className="inspector-item">
          <strong>isValid():</strong> {String(res.isValid())}
        </div>
        <div className="inspector-item">
          <strong>hasErrors():</strong> {String(res.hasErrors())}
        </div>
        <div className="inspector-item">
          <strong>hasErrors('username'):</strong> {String(res.hasErrors('username'))}
        </div>
        <div className="inspector-item">
          <strong>getError('username'):</strong> {res.getError('username') || 'undefined'}
        </div>
        <div className="inspector-item">
          <strong>errorCount:</strong> {res.errorCount}
        </div>
         <div className="inspector-item">
          <strong>testCount:</strong> {res.testCount}
        </div>
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
.App { display: flex; gap: 20px; padding: 20px; }
.form-container, .result-container { flex: 1; }
h3 { margin-top: 0; font-size: 1.1rem; border-bottom: 1px solid #444; padding-bottom: 10px; }
label { display: block; margin-top: 15px; font-size: 0.9rem; color: #aaa; }
input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  background: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}
.inspector-item {
  margin-bottom: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  padding: 5px;
  background: #222;
  border-radius: 4px;
}
.inspector-item strong { color: #61dafb; }
@media (max-width: 600px) { .App { flex-direction: column; } }
`;

export default function AccessingResultSandpack() {
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
          activeFile: '/App.js',
          showCommonFiles: false,
          visibleFiles: ['/App.js', '/suite.js'],
          editorHeight: 500,
        }}
      />
    </div>
  );
}

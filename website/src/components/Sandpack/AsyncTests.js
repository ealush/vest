import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from 'vest';
import { doesUserExist } from './api';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username already taken', async () => {
    await doesUserExist(data.username);
  });
});

export default suite;
`;

const ApiCode = `export async function doesUserExist(username) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (['admin', 'root', 'taken'].includes(username)) {
    throw new Error();
  }
}
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
    
    // Validate
    suite
      .only(name)
      .afterEach(() => setRes(suite.get()))
      .run(newForm);
    
    // Update pending state immediately for UI feedback
    setRes(suite.get());
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
import suite from "./suite";

export default function FormLayout({ form, onChange, res = suite.get() }) {
  return (
    <div className="App">
      <h3>Async Validation Demo</h3>
      
      <div className="form-group">
        <div className="label-row">
          <label>Username:</label>
          {suite.isPending('username') && <span className="spinner" />}
        </div>
        <input 
          name="username"
          value={form.username || ""} 
          onChange={onChange}
          className={suite.hasErrors('username') ? 'invalid' : ''}
          placeholder="Try 'taken' or 'admin'"
        />
        {suite.hasErrors('username') && (
          <div className="error">{suite.getError('username')}</div>
        )}
      </div>

      <div className="status">
        Async tests simulate API calls. <br/>
        Try typing quickly to see race-condition handling!
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
.form-group { margin-bottom: 15px; }
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
label { font-weight: bold; font-size: 0.9rem;}
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
.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #444;
  border-top-color: #61dafb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.status { margin-top: 20px; color: #888; font-size: 0.9rem; line-height: 1.5; }
`;

export default function AsyncTestsSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react"
        theme="dark"
        files={{
          '/suite.js': SuiteCode,
          '/App.js': AppCode,
          '/api.js': ApiCode,
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

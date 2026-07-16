import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
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
    
    // Validate focus field
    suite.only(name).run(newForm);
    setRes(suite.get());
  };

  const resetField = (name) => {
    // Reset state for a specific field
    suite.resetField(name);
    setRes(suite.get());
  };

  const removeField = (name) => {
    // Completely remove a field from the validation result
    suite.remove(name);
    setRes(suite.get());
  };

  const resetSuite = () => {
    // Reset entire suite
    suite.reset();
    setForm({});
    setRes(suite.get());
  };

  return (
    <FormLayout 
      form={form} 
      onChange={handleChange} 
      resetField={resetField}
      removeField={removeField}
      resetSuite={resetSuite}
      res={res} 
    />
  );
}
`;

const FormLayoutCode = `import React from "react";
import suite from './suite';

export default function FormLayout({ form, onChange, resetField, removeField, resetSuite, res }) {
  return (
    <div className="App">
      <h3>Suite Methods Demo</h3>
      
      {['username', 'email'].map(field => (
        <div className="form-group" key={field}>
          <div className="label-row">
            <label>{field}:</label>
            <div className="controls">
              <button onClick={() => resetField(field)} title="Reset Field">↺</button>
              <button onClick={() => removeField(field)} title="Remove Field">×</button>
            </div>
          </div>
          <input 
            name={field}
            value={form[field] || ""} 
            onChange={onChange}
            className={suite.hasErrors(field) ? 'invalid' : ''}
          />
          {suite.hasErrors(field) && (
            <div className="error">{suite.getError(field)}</div>
          )}
           <div className="field-status">
            hasErrors: {String(suite.hasErrors(field))}
          </div>
        </div>
      ))}

      <div className="actions">
        <button className="reset-all" onClick={resetSuite}>Reset Suite</button>
      </div>

      <div className="status">
        <strong>testCount:</strong> {suite.get().testCount} <br/>
        <strong>errorCount:</strong> {suite.get().errorCount}
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
.form-group { margin-bottom: 20px; background: #222; padding: 10px; border-radius: 6px; border: 1px solid #333; }
.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
label { font-weight: bold; font-size: 0.9rem; text-transform: capitalize; }
input {
  width: 100%; box-sizing: border-box;
  padding: 8px; border-radius: 4px; border: 1px solid #444;
  background: #14161a; color: #fff; font-size: 1rem;
}
input.invalid { border-color: #ff5f56; }
input:focus { outline: none; border-color: #61dafb; }
.error { color: #ff5f56; font-size: 0.85rem; margin-top: 4px; }
.controls button {
  background: transparent; border: none; color: #888; cursor: pointer; font-size: 1.1rem; padding: 0 5px;
}
.controls button:hover { color: #fff; }
.field-status { font-family: monospace; font-size: 0.8rem; color: #666; margin-top: 5px; }
.actions { margin-top: 20px; text-align: center; }
.reset-all { 
  background: #333; color: #fff; border: 1px solid #555; 
  padding: 8px 16px; border-radius: 4px; cursor: pointer; 
}
.reset-all:hover { background: #444; }
.status { margin-top: 20px; border-top: 1px solid #333; padding-top: 15px; color: #888; font-size: 0.9rem; font-family: monospace; }
`;

export default function SuiteMethodsSandpack() {
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

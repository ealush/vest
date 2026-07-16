import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce, warn } from 'vest';

const suite = create((data = {}) => {
  test('password', 'Password is required', () => {
    enforce(data.password).isNotBlank();
  });

  test('password', 'Password must be at least 6 chars', () => {
    enforce(data.password).longerThan(5);
  });

  // Warn-only test: Doesn't affect isValid()
  test('password', 'Weak password: Add a number', () => {
    warn();
    enforce(data.password).matches(/[0-9]/);
  });
  
  test('password', 'Medium password: Add a special char', () => {
    warn();
    enforce(data.password).matches(/[^a-zA-Z0-9]/);
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
    
    // Validate
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
  // Helpers to get specific message types
  const getErrors = (field) => res.getErrors(field);
  const getWarnings = (field) => res.getWarnings(field);

  return (
    <div className="App">
      <h3>Password Strength Demo</h3>
      
      <div className="form-group">
        <label>Password:</label>
        <input 
          name="password"
          type="password"
          value={form.password || ""} 
          onChange={onChange}
          className={res.hasErrors('password') ? 'invalid' : res.hasWarnings('password') ? 'warning' : ''}
        />
        
        {/* Render Errors (Red) */}
        {getErrors('password').map((msg, i) => (
          <div key={i} className="error">{msg}</div>
        ))}
        
        {/* Render Warnings (Yellow) */}
        {getWarnings('password').map((msg, i) => (
          <div key={i} className="warning-msg">⚠️ {msg}</div>
        ))}
      </div>

      <div className="status">
        <strong>isValid(): {String(res.isValid())}</strong><br/>
        (Warnings do not make the suite invalid!)
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
input.warning { border-color: #fbca04; }
input:focus { outline: none; border-color: #61dafb; }

.error { color: #ff5f56; font-size: 0.85rem; margin-top: 4px; }
.warning-msg { color: #fbca04; font-size: 0.85rem; margin-top: 4px; }

.status { margin-top: 20px; border-top: 1px solid #333; padding-top: 15px; color: #888; font-size: 0.9rem; }
.status strong { color: #fff; }
`;

export default function WarnOnlyTestsSandpack() {
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
          activeFile: '/suite.js',
          showCommonFiles: false,
          visibleFiles: ['/suite.js', '/App.js'],
          editorHeight: 600,
        }}
      />
    </div>
  );
}

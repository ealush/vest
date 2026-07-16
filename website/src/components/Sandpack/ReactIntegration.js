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
  test('username', 'Username must be at least 3 characters', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  test('email', 'Please enter a valid email', () => {
    enforce(data.email).isEmail();
  });
});

export default suite;
`;

const AppCode = `import React, { useState } from "react";
import suite from "./suite";
import "./styles.css";

export default function App() {
  const [formData, setFormData] = useState({ username: '', email: '' });

  const handleChange = (name, value) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    suite.only(name).run(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await suite.run(formData);
    
    if (suite.isValid()) {
      console.log('Form is valid!', formData);
      // Submit form
    }
  };

  return (
    <div className="App">
      <h1>React + Vest</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            name="username"
            value={formData.username}
            onChange={e => handleChange('username', e.target.value)}
            className={suite.hasErrors('username') ? 'invalid' : ''}
          />
          {suite.hasErrors('username') && (
            <div className="error">{suite.getError('username')}</div>
          )}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            name="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            className={suite.hasErrors('email') ? 'invalid' : ''}
          />
          {suite.hasErrors('email') && (
            <div className="error">{suite.getError('email')}</div>
          )}
        </div>

        <button type="submit" disabled={!suite.isValid()}>
          Submit
        </button>
        
        <div className="status">
          Status: {suite.isValid() ? '✅ Valid' : '❌ Invalid'}
        </div>
      </form>
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
  max-width: 500px;
}

h1 { 
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.form-group { 
  margin-bottom: 15px;
}

label { 
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9rem;
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

input.invalid { 
  border-color: #ff5f56;
}

input:focus { 
  outline: none;
  border-color: #61dafb;
}

.error { 
  color: #ff5f56;
  font-size: 0.85rem;
  margin-top: 4px;
}

button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  background: #61dafb;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}

.status {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #333;
  color: #888;
  font-size: 0.9rem;
}
`;

export default function ReactIntegrationSandpack() {
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
            vest: 'latest',
          },
        }}
        options={{
          activeFile: '/App.js',
          showConsole: false,
          showCommonFiles: false,
          visibleFiles: ['/suite.js', '/App.js'],
          editorHeight: 500,
        }}
      />
    </div>
  );
}

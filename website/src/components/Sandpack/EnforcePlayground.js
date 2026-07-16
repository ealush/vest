import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const LogicCode = `import { enforce } from "vest";

export default function runCheck(val) {
  enforce(val)
    .isString()
    .longerThan(2)
    .shorterThan(10);
}
`;

const AppCode = `import React, { useState, useEffect } from "react";
import runCheck from "./check";
import "./styles.css";

export default function App() {
  const [value, setValue] = useState("vest");
  const [result, setResult] = useState(() => handleCheck("vest"));

  function handleCheck(val) {
    try {
      runCheck(val);
      return { pass: true, message: "Valid!" };
    } catch (e) {
      return {
        pass: false,
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setResult(handleCheck(val));
  };

  return (
    <div className="App">
      <h3>Enforce Playground</h3>
      <div className="input-group">
        <label>Test Value:</label>
        <input 
          value={value} 
          onChange={handleChange}
          className={result.pass ? 'valid' : 'invalid'}
        />
      </div>
      <div className={\`result \${result.pass ? 'pass' : 'fail'}\`}>
        <strong>Result:</strong> {result.message}
      </div>
       <div className="instructions">
        Edit <strong>check.js</strong> to change assertions.
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
.input-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; color: #aaa; }
input {
  width: 100%;
  padding: 10px;
  background: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
  font-size: 1.1rem;
}
input.valid { border-color: #27c93f; }
input.invalid { border-color: #ff5f56; }
.result {
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
}
.result.pass { background: rgba(39, 201, 63, 0.2); border: 1px solid #27c93f; }
.result.fail { background: rgba(255, 95, 86, 0.2); border: 1px solid #ff5f56; }
.instructions {
  margin-top: 20px;
  color: #888;
  font-size: 0.9rem;
  line-height: 1.5;
}
`;

export default function EnforcePlayground() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react"
        theme="dark"
        files={{
          '/check.js': LogicCode,
          '/App.js': AppCode,
          '/styles.css': StylesCode,
        }}
        customSetup={{
          dependencies: {
            vest: '^6.3.2',
          },
        }}
        options={{
          activeFile: '/check.js',
          showCommonFiles: false,
          visibleFiles: ['/check.js'],
          editorHeight: 450,
        }}
      />
    </div>
  );
}

import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const LogicCode = `import { enforce, compose } from "vest";

// Compose multiple rules into one!
// This rule checks if a value is:
// 1. A number
// 2. At least 18
// 3. Less than 120
const isValidAge = compose(
  enforce.isNumber(),
  enforce.greaterThanOrEquals(18),
  enforce.lessThan(120)
);

export default function runCheck(val) {
  // Try changing val to "20", 150, or a string
  return isValidAge.run(val);
}
`;

const AppCode = `import React, { useState } from "react";
import runCheck from "./check";
import "./styles.css";

export default function App() {
  const [value, setValue] = useState(25);
  // Parse input as number if possible for the demo
  const typedValue = isNaN(Number(value)) ? value : Number(value);
  
  const result = runCheck(typedValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="App">
      <h3>Compose: Reusable Logic</h3>
      <div className="input-group">
        <label>Age (Try 10, 150, or "text"):</label>
        <input 
          value={value} 
          onChange={handleChange}
          className={result.pass ? 'valid' : 'invalid'}
        />
      </div>
      <div className={\`result \${result.pass ? 'pass' : 'fail'}\`}>
        <strong>Result:</strong> {result.pass ? "Valid Age" : "Invalid Age"}
      </div>
       <div className="instructions">
        Edit <strong>check.js</strong> to compose your own rules!
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

export default function ComposingRulesSandpack() {
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

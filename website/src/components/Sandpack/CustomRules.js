import React from 'react';
import clsx from 'clsx';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const LogicCode = `import { enforce } from "vest";

// 1. Extend enforce with a custom rule
enforce.extend({
  isSameDomain(email, domain) {
    return {
      pass: email.endsWith('@' + domain),
      message: () => \`Email must be from \${domain} domain\`
    };
  }
});

// 2. Use it!
export default function runCheck(val) {
  // Try changing domain to "example.com"
  enforce(val).isSameDomain("vestjs.dev");
}
`;

const AppCode = `import React, { useState } from "react";
import runCheck from "./custom";
import "./styles.css";

export default function App() {
  const [value, setValue] = useState("user@gmail.com");
  
  let result = { pass: true, message: "Valid Domain!" };
  try {
    runCheck(value);
  } catch (e) {
    result = {
      pass: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="App">
      <h3>Custom Rules Demo</h3>
      <div className="input-group">
        <label>Email (must be @vestjs.dev):</label>
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
        Edit <strong>custom.js</strong> to create your own rules!
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

export default function CustomRulesSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react"
        theme="dark"
        files={{
          '/custom.js': LogicCode,
          '/App.js': AppCode,
          '/styles.css': StylesCode,
        }}
        customSetup={{
          dependencies: {
            vest: 'latest',
          },
        }}
        options={{
          activeFile: '/custom.js',
          showCommonFiles: false,
          visibleFiles: ['/custom.js'],
          editorHeight: 450,
        }}
      />
    </div>
  );
}

import React from 'react';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, enforce, optional, test } from 'vest';

const suite = create((data = {}) => {
  // \`optional\` marks fields as fully valid if they are omitted.
  // Here, we define that each field is optional *only if* at least
  // one of the other fields is present and truthy.
  optional({
    email: () => !!data.sms || !!data.push,
    sms: () => !!data.email || !!data.push,
    push: () => !!data.email || !!data.sms,
  });

  // These tests ensure each field is present.
  // If the \`optional\` condition above is met (meaning another field is present),
  // Vest will simply drop these tests and consider the omitted fields valid.
  test('email', 'Provide at least one channel', () => {
    enforce(data.email).isTruthy();
  });

  test('sms', 'Provide at least one channel', () => {
    enforce(data.sms).isTruthy();
  });

  test('push', 'Provide at least one channel', () => {
    enforce(data.push).isTruthy();
  });
});

export default suite;
`;

const AppCode = `import React, { useState } from 'react';
import suite from './suite';
import './styles.css';

export default function App() {
  const [channels, setChannels] = useState({ email: false, sms: false, push: false });
  const result = suite.run(channels);

  return (
    <div className="App">
      <h3>At least one contact channel</h3>
      {Object.keys(channels).map(name => (
        <label key={name}>
          <input
            type="checkbox"
            checked={channels[name]}
            onChange={() => setChannels(prev => ({ ...prev, [name]: !prev[name] }))}
          />
          {name}
        </label>
      ))}

      <div className={result.isValid() ? 'ok' : 'error'}>
        {result.isValid() ? 'Valid: at least one option was selected.' : result.getError()?.message || 'At least one option must be selected.'}
      </div>
    </div>
  );
}
`;

const StylesCode = `body { background: #111; color: #f4f4f4; font-family: sans-serif; }
.App { max-width: 460px; margin: 0 auto; padding: 20px; }
label { display: block; margin: 10px 0; text-transform: capitalize; }
input { margin-right: 8px; }
.error { margin-top: 14px; color: #ff7b72; }
.ok { margin-top: 14px; color: #3fb950; }
`;

export default function AnyTestRecipeSandpack() {
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
          showCommonFiles: false,
          visibleFiles: ['/App.js', '/suite.js'],
          editorHeight: 560,
        }}
      />
    </div>
  );
}

import React from 'react';
import Sandpack from './index';
import commonStyles from '../RawExample.module.css';

const SuiteCode = `import { create, test, enforce, optional } from 'vest';

const suite = create((data = {}) => {
  // If \`pet_name\` is provided, \`owner_name\` becomes optional, and vice versa.
  // This allows the form to be valid as long as at least one of them is provided.
  optional({
    pet_name: () => !!data.owner_name,
    owner_name: () => !!data.pet_name,
  });

  // The \`isNotBlank\` assertion checks that the string isn't an empty string.
  test('pet_name', 'Pet name is required when owner name is blank', () => {
    enforce(data.pet_name).isNotBlank();
  });

  test('owner_name', 'Owner name is required when pet name is blank', () => {
    enforce(data.owner_name).isNotBlank();
  });
});

export default suite;
`;

const AppCode = `import React, { useState } from 'react';
import suite from './suite';
import './styles.css';

export default function App() {
  const [form, setForm] = useState({ pet_name: '', owner_name: '' });
  const result = suite.run(form);

  return (
    <div className="App">
      <h3>Mutually optional fields</h3>
      <input
        placeholder="pet name"
        value={form.pet_name}
        onChange={e => setForm(prev => ({ ...prev, pet_name: e.target.value }))}
      />
      <p className={result.hasErrors('pet_name') ? 'error' : 'ok'}>{result.getErrors('pet_name').join(', ') || 'No errors'}</p>

      <input
        placeholder="owner name"
        value={form.owner_name}
        onChange={e => setForm(prev => ({ ...prev, owner_name: e.target.value }))}
      />
      <p className={result.hasErrors('owner_name') ? 'error' : 'ok'}>{result.getErrors('owner_name').join(', ') || 'No errors'}</p>
    </div>
  );
}
`;

const StylesCode = `body { background: #0d1117; color: #fff; font-family: sans-serif; }
.App { padding: 20px; max-width: 480px; margin: 0 auto; }
input { display: block; width: 100%; margin-top: 10px; background: #161b22; border: 1px solid #30363d; color: #fff; border-radius: 6px; padding: 8px; }
p { min-height: 20px; margin: 6px 0 12px; }
.error { color: #ff7b72; }
.ok { color: #3fb950; }
`;

export default function OptionalFieldsSandpack() {
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
        customSetup={{ dependencies: { vest: 'latest' } }}
        options={{
          activeFile: '/suite.js',
          showCommonFiles: false,
          visibleFiles: ['/suite.js', '/App.js'],
          editorHeight: 560,
        }}
      />
    </div>
  );
}

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import commonStyles from '../RawExample.module.css';

const SchemaSuiteCode = `import { create, test, enforce } from 'vest';

// Define a schema — field names and data types
// are inferred automatically.
const userSchema = enforce.shape({
  username: enforce.isString(),
  email: enforce.isString(),
  age: enforce.isNumber(),
});

const suite = create(data => {
  // \`data\` is typed as:
  // { username: string; email: string; age: number }

  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  // Destructured helpers are also typed:
  const { only, skip, optional } = suite;
  optional('email');
}, userSchema);

// All suite APIs are typed to schema keys.
// Try changing 'username' to an invalid field name
// to see a type error.
suite.remove('username');
suite.resetField('email');
suite.focus({ only: 'username' });
suite.only('age');
suite.afterField('email', () => {});

// Result selectors are typed too:
const result = suite.get();
result.hasErrors('username');
result.getErrors('email');
result.isValid('age');

// .run() enforces the schema data shape:
suite.run({
  username: 'alice',
  email: 'alice@example.com',
  age: 30,
});

export default suite;
`;

const ConfigSuiteCode = `import { create, test, enforce, group } from 'vest';

// Declare field and group names explicitly
// via the config generic.
const suite = create<{
  fields: 'username' | 'email' | 'password';
  groups: 'auth' | 'profile';
}>(data => {

  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  group('auth', () => {
    test('password', 'Password is required', () => {
      enforce(data.password).isNotBlank();
    });
  });

  // Destructured helpers are typed:
  const { only, skip, include, optional } = suite;
  optional('email');
});

// All suite APIs enforce the declared names.
// Try changing 'username' to 'phone' to see a
// type error.
suite.remove('username');
suite.resetField('email');
suite.focus({ only: 'password', onlyGroup: 'auth' });
suite.only('username');
suite.afterField('email', () => {});

// Result selectors are typed:
const result = suite.get();
result.hasErrors('username');
result.getErrors('email');
result.isValid('password');

export default suite;
`;

function EditorOnly({ code }) {
  return (
    <BrowserOnly fallback={<div>Loading Editor...</div>}>
      {() => {
        const {
          SandpackProvider,
          SandpackCodeEditor,
        } = require('@codesandbox/sandpack-react');
        return (
          <SandpackProvider
            template="react-ts"
            theme="dark"
            files={{ '/suite.ts': code }}
            customSetup={{ dependencies: { vest: 'next' } }}
            options={{ activeFile: '/suite.ts' }}
          >
            <SandpackCodeEditor style={{ height: 500 }} />
          </SandpackProvider>
        );
      }}
    </BrowserOnly>
  );
}

export function SchemaTypedSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <EditorOnly code={SchemaSuiteCode} />
    </div>
  );
}

export function ConfigTypedSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <EditorOnly code={ConfigSuiteCode} />
    </div>
  );
}

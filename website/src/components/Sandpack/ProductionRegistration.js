import React from 'react';

import Sandpack from './index';
import commonStyles from '../RawExample.module.css';
import appCode from '../../../../examples/production-registration/src/DemoApp.tsx?raw';
import boundarySchemaCode from '../../../../examples/production-registration/src/boundarySchema.ts?raw';
import formCode from '../../../../examples/production-registration/src/RegistrationForm.tsx?raw';
import suiteCode from '../../../../examples/production-registration/src/registrationSuite.ts?raw';
import stylesCode from '../../../../examples/production-registration/src/styles.css?raw';
import typesCode from '../../../../examples/production-registration/src/types.ts?raw';

export default function ProductionRegistrationSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react-ts"
        theme="dark"
        files={{
          '/App.tsx': appCode,
          '/RegistrationForm.tsx': formCode,
          '/boundarySchema.ts': boundarySchemaCode,
          '/registrationSuite.ts': suiteCode,
          '/styles.css': stylesCode,
          '/types.ts': typesCode,
        }}
        customSetup={{
          dependencies: {
            '@hookform/resolvers': '^5.4.0',
            'react-hook-form': '^7.81.0',
            vest: 'latest',
            zod: '^4.4.3',
          },
        }}
        options={{
          activeFile: '/registrationSuite.ts',
          editorHeight: 680,
          showConsole: true,
          showTabs: true,
          visibleFiles: [
            '/registrationSuite.ts',
            '/RegistrationForm.tsx',
            '/App.tsx',
          ],
        }}
      />
    </div>
  );
}

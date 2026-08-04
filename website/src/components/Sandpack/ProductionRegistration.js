import React from 'react';

import Sandpack from './index';
import commonStyles from '../RawExample.module.css';
import { productionRegistrationFiles } from '../../generated/sandpackSources';

export default function ProductionRegistrationSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react-ts"
        theme="dark"
        files={productionRegistrationFiles}
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

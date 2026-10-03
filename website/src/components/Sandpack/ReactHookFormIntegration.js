import React from 'react';

import Sandpack from './index';
import commonStyles from '../RawExample.module.css';
import { reactHookFormFiles } from '../../generated/sandpackSources';

export default function ReactHookFormIntegration() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react-ts"
        theme="dark"
        files={reactHookFormFiles}
        customSetup={{
          dependencies: {
            '@hookform/resolvers': '5.7.1',
            '@standard-schema/spec': '1.1.0',
            'react-hook-form': '7.84.0',
            vest: '6.3.2',
          },
        }}
        options={{
          activeFile: '/vestResolver.ts',
          editorHeight: 760,
          showConsole: true,
          showTabs: true,
          visibleFiles: [
            '/App.tsx',
            '/integration.ts',
            '/vestResolver.ts',
            '/suite.ts',
          ],
        }}
      />
    </div>
  );
}

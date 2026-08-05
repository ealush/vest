import React from 'react';

import Sandpack from './index';
import commonStyles from '../RawExample.module.css';
import { tanStackRouterFiles } from '../../generated/sandpackSources';

export default function TanStackRouterIntegration() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react-ts"
        theme="dark"
        files={tanStackRouterFiles}
        customSetup={{
          dependencies: {
            '@tanstack/react-router': '1.170.18',
            vest: 'latest',
          },
        }}
        options={{
          activeFile: '/router.tsx',
          editorHeight: 640,
          showConsole: true,
          showTabs: true,
          visibleFiles: ['/router.tsx', '/App.tsx'],
        }}
      />
    </div>
  );
}

import React from 'react';

import Sandpack from './index';
import commonStyles from '../RawExample.module.css';
import { tanStackFormFiles } from '../../generated/sandpackSources';

export default function TanStackFormIntegration() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react-ts"
        theme="dark"
        files={tanStackFormFiles}
        customSetup={{
          dependencies: {
            '@tanstack/react-form': '1.33.3',
            vest: 'latest',
          },
        }}
        options={{
          activeFile: '/suite.ts',
          editorHeight: 640,
          showConsole: true,
          showTabs: true,
          visibleFiles: ['/App.tsx', '/suite.ts'],
        }}
      />
    </div>
  );
}

import React from 'react';

import Sandpack from './index';
import commonStyles from '../RawExample.module.css';
import { honoFiles } from '../../generated/sandpackSources';

export default function HonoIntegration() {
  return (
    <div className={commonStyles.codeWindow}>
      <Sandpack
        template="react-ts"
        theme="dark"
        files={honoFiles}
        customSetup={{
          dependencies: {
            '@hono/standard-validator': '0.3.0',
            hono: '4.13.0',
            vest: 'latest',
          },
        }}
        options={{
          activeFile: '/app.ts',
          editorHeight: 640,
          showConsole: true,
          showTabs: true,
          visibleFiles: ['/app.ts', '/App.tsx'],
        }}
      />
    </div>
  );
}

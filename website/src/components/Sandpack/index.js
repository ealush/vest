import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Sandpack as SandpackReact } from '@codesandbox/sandpack-react';

export default function Sandpack(props) {
  return (
    <BrowserOnly fallback={<div>Loading Editor...</div>}>
      {() => <SandpackReact {...props} />}
    </BrowserOnly>
  );
}

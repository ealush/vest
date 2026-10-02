import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import DemoApp from './DemoApp';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');
createRoot(root).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);

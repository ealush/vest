import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import Sandpack from '@site/src/components/Sandpack';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Map the "<Sandpack>" tag to our component
  Sandpack,
};

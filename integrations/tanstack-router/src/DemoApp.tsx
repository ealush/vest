import { RouterProvider } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { createSearchRouter } from './router';
import './styles.css';

export default function DemoApp() {
  const [url, setUrl] = useState('/?page=2&query=%20vest%20');
  const [activeUrl, setActiveUrl] = useState(url);
  const router = useMemo(() => createSearchRouter(activeUrl), [activeUrl]);

  return (
    <main>
      <h1>Vest + TanStack Router</h1>
      <label htmlFor="route-url">Route URL</label>
      <input
        id="route-url"
        value={url}
        onChange={event => setUrl(event.target.value)}
      />
      <button type="button" onClick={() => setActiveUrl(url)}>
        Load route
      </button>
      <RouterProvider router={router} />
    </main>
  );
}

import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import styles from './Demo.module.css';
import commonStyles from './Common.module.css';

// I only care of the initial load.  I don't want to kicks off the timeout if
// the user navigates away and then back to the page.
let initialized = false;

export default function Demo() {
  const [currentSandbox, setCurrentSandbox] = useState(null);
  const [isInitialized, setIsInitialized] = useState(initialized);
  const [shouldRender, setShouldRender] = useState(null);

  useEffect(() => {
    if (shouldRender === null) {
      setShouldRender(Boolean((window?.innerWidth ?? 0) > 500));
    }

    if (isInitialized) {
      return;
    }

    setTimeout(() => {
      // Why state? along with the global flag?
      // Because the state will trigger a re-render. The global flag will not.
      setIsInitialized(true);
      setCurrentSandbox(currentSandbox => currentSandbox ?? 0);
      initialized = true;
    }, 1500);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <section className={clsx(styles.demo, commonStyles.main_section_centered)}>
      <div className={clsx('container', styles.vestDemo)}>
        <h2>Try It Live</h2>
        <div className={styles.demoSwitchWrapper}>
          {embedLinks.map((link, i) => (
            <button
              key={link.title}
              className={clsx(styles.demoSwitch, {
                [styles.demoSwitchActive]: i === currentSandbox,
              })}
              onClick={() => setCurrentSandbox(i)}
            >
              {link.title}
            </button>
          ))}
        </div>
        <div className={styles.demoWrapper}>
          {isInitialized ? (
            <Sandbox {...embedLinks[currentSandbox]} />
          ) : (
            <div className={styles.sandbox}></div>
          )}
        </div>
      </div>
    </section>
  );
}

function Sandbox({ title, src }) {
  return (
    <iframe
      src={src}
      className={styles.sandbox}
      title={title}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    ></iframe>
  );
}

const embedLinks = [
  {
    title: 'React',
    src: 'https://codesandbox.io/embed/react-vest-5-gdc698?fontsize=14&hidenavigation=0&module=%2Fsrc%2Fsuite.js&theme=dark',
  },

  {
    title: 'Vue',
    src: 'https://codesandbox.io/embed/vue-vest-5-d1g236?fontsize=14&hidenavigation=0&module=%2Fsrc%2Fsuite.js&theme=dark',
  },
  {
    title: 'Svelte',
    src: 'https://codesandbox.io/embed/svelte-vest-5-imnq9z?fontsize=14&hidenavigation=1&module=suite.js&theme=dark',
  },
  {
    title: 'Vanilla',
    src: 'https://codesandbox.io/embed/vest-vanilla-js-vest-5-3v4pqk?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fsuite.js&theme=dark',
  },
];

import clsx from 'clsx';
import React, { useState } from 'react';

import styles from './Demo.module.css';

export default function Demo() {
  const [currentSandbox, setCurrentSandbox] = useState(0);

  return (
    <section className={styles.demo}>
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
          <Sandbox {...embedLinks[currentSandbox]} />
        </div>
      </div>
    </section>
  );
}

function Sandbox({ title, src }) {
  return (
    <iframe
      src={src}
      className={styles.sandboxIframe}
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

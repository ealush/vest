import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import Demo from '../components/Demo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [copied, setCopied] = React.useState(false);
  const installCommand = 'npm i vest';

  const handleCopy = () => {
    if (typeof navigator === 'undefined' || !navigator?.clipboard?.writeText) {
      return;
    }

    navigator.clipboard
      .writeText(installCommand)
      .then(() => setCopied(true))
      .catch(() => setCopied(true));

    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroGlow} />
      <div className={styles.heroMesh} />
      <div className="container">
        <div className={styles.heroContent}>
          <div>
            <p className={styles.kicker}>Modern validations for modern apps</p>
            <h1 className={styles.heroTitle}>
              Declarative validations
              <br />
              <span className={styles.heroHighlight}>inspired by unit testing</span>
            </h1>
            <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
              {siteConfig.tagline}
            </p>
            <div className={styles.actionRow}>
              <Link className={clsx('button button--primary', styles.primaryButton)} to="/docs/get_started">
                Get started
              </Link>
              <Link className={clsx('button button--secondary', styles.secondaryButton)} to="https://github.com/ealush/vest">
                View on GitHub
              </Link>
            </div>
            <div className={styles.installCard}>
              <div className={styles.installLabel}>Install with npm</div>
              <div className={styles.installRow}>
                <code className={styles.installCommand}>{installCommand}</code>
                <button type="button" className={styles.copyButton} onClick={handleCopy}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.codeCard}>
              <div className={styles.codeHeader}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <pre className={styles.codeSnippet}>
                <code>
                  {`import vest, { test, enforce } from 'vest';

const suite = vest.create('signup', () => {
  test('password', 'Must be strong', () => {
    enforce(password).longerThanOrEquals(8);
  });
});`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Validations Framework`}
      description="Vest is a validations framework inspired by the syntax and style of testing libraries."
    >
      <HomepageHeader />
      <main>
        <RawExample />
        <HomepageFeatures />
        <Demo />
      </main>
    </Layout>
  );
}

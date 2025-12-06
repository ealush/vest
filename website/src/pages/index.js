import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useState } from 'react';

import Demo from '../components/Demo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [copied, setCopied] = useState(false);
  const installCommand = 'npm i vest';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroGlow} />
      <div className={styles.heroGrid}>
        <div className={styles.heroContent}>
          <p className={styles.heroOverline}>Modern validations for ambitious teams</p>
          <h1 className="hero__title">
            Declarative validations
            <br />
            <span className={styles.heroHighlight}>inspired by unit testing</span>
          </h1>
          <p className={clsx('hero__subtitle', styles.heroTagline)}>
            {siteConfig.tagline}
          </p>
          <div className={styles.ctaGroup}>
            <Link className={clsx('button button--primary', styles.primaryCta)} to="/docs/get_started">
              Get started
            </Link>
            <Link className={clsx('button button--secondary', styles.secondaryCta)} to="/docs/api_reference">
              Explore the API
            </Link>
            <button type="button" className={clsx('button', styles.copyButton)} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy install'}
            </button>
          </div>
          <div className={styles.installBar}>
            <code>{installCommand}</code>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.panelHeader}>Confidence without ceremony</div>
          <div className={styles.panelBody}>
            <div className={styles.panelBadge}>Zero deps</div>
            <pre className={styles.panelCode}>
              <code>
                {`suite('signup', () => {
  test('username', async () => {
    await enforce(username).isNotBlank();
  });

  test('password', () => {
    enforce(password).longerThan(8);
  });
});`}
              </code>
            </pre>
            <div className={styles.panelFooter}>
              <span>Framework agnostic</span>
              <span className={styles.pulse} />
              <span>Async ready</span>
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

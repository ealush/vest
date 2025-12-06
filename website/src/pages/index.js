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
    navigator.clipboard.writeText(installCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroGlow} />
      <div className={styles.heroGrid}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>Modern validations framework</div>
          <h1 className={clsx('hero__title', styles.heroTitle)}>
            Declarative validations
            <span className={styles.heroHighlight}> inspired by testing</span>
          </h1>
          <p className={clsx('hero__subtitle', styles.heroTagline)}>
            {siteConfig.tagline}
          </p>
          <div className={styles.heroActions}>
            <Link
              className={clsx('button button--lg', styles.primaryCta)}
              to="/docs/get_started"
            >
              Get Started
            </Link>
            <Link
              className={clsx('button button--secondary button--lg', styles.secondaryCta)}
              to="https://github.com/ealush/vest"
            >
              View on GitHub
            </Link>
          </div>
          <div className={styles.installBar}>
            <code className={styles.installCommand}>{installCommand}</code>
            <button
              type="button"
              className={styles.copyButton}
              onClick={handleCopy}
              aria-live="polite"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className={styles.heroShowcase}>
          <div className={styles.showcaseCard}>
            <div className={styles.cardGlow} />
            <div className={styles.cardHeader}>Suite anatomy</div>
            <pre className={styles.codeBlock}>
              <code>{`import vest, { test, enforce } from 'vest';

const suite = vest.create('signup', () => {
  test('username', 'Must be at least 3 chars', () => {
    enforce(username).longerThanOrEquals(3);
  });
});

export default suite;`}</code>
            </pre>
            <div className={styles.cardFooter}>
              Built for predictable DX
              <span className={styles.cardPill}>Framework agnostic</span>
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

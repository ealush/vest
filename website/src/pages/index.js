import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import Demo from '../components/Demo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';

import styles from './index.module.css';

const installCommand = 'npm i vest';

function InstallSnippet() {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyToClipboard = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(installCommand).then(() => setCopied(true));
  };

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className={styles.installSnippet}
    >
      <code className={styles.installText}>{installCommand}</code>
      <span className={styles.copyLabel}>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero', styles.hero)}>
      <div className={styles.heroBackdrop}>
        <span className={styles.heroGlow} />
        <span className={styles.heroGradient} />
      </div>

      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Modern validation toolkit</p>
          <h1 className="hero__title">
            Declarative validations
            <br />
            <span className={styles.heroHighlight}>inspired by unit testing</span>
          </h1>
          <p className={clsx('hero__subtitle', styles.heroLead)}>
            {siteConfig.tagline}
          </p>

          <div className={styles.ctaGroup}>
            <Link
              className={clsx('button button--primary button--lg', styles.primaryCta)}
              to="/docs/get_started"
            >
              Get started
            </Link>
            <Link
              className={clsx('button button--outline button--lg', styles.secondaryCta)}
              to="https://github.com/ealush/vest"
            >
              View on GitHub
            </Link>
            <InstallSnippet />
          </div>

          <ul className={styles.heroMeta}>
            <li>Framework agnostic</li>
            <li>Async-safe validations</li>
            <li>Zero dependencies</li>
          </ul>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.panelHeader}>Confidence without ceremony</div>
          <div className={styles.panelBody}>
            <div className={styles.panelRow}>
              <span className={styles.pill}>DX Focused</span>
              <p>
                Vest mirrors the testing APIs you already know, so writing and
                reading validations feels effortless.
              </p>
            </div>
            <div className={styles.panelRow}>
              <span className={styles.pill}>Predictable</span>
              <p>
                Deterministic runs with async orchestration keep suites stable
                across complex forms and flows.
              </p>
            </div>
            <div className={styles.panelRow}>
              <span className={styles.pill}>Composable</span>
              <p>
                Share and reuse validation logic across apps while keeping
                bundles lean and dependency-free.
              </p>
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

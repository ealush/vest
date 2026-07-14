import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useState } from 'react';

import AsyncRaceDemo from '../components/AsyncRaceDemo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';

import styles from './index.module.css';

function HomepageHeader() {
  const [copied, setCopied] = useState(false);
  const installCommand = 'npm i vest';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDemoScroll = () => {
    document
      .getElementById('async-race-demo')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const heroCode = `import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'already taken', async ({ signal }) => {
    const { available } = await checkUsername(data.username, { signal });
    enforce(available).isTruthy();
  });

  test('password', 'must be 8+ chars', () => {
    enforce(data.password).longerThan(7);
  });
});

suite.run(formData);`;

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroGlow} />
      <div className={styles.heroGrid}>
        <div className={styles.heroContent}>
          <div className={styles.heroBrand}>
            <img src="/img/logo.svg" alt="Vest" className={styles.heroLogo} />
            <span className={styles.heroLogoText}>Vest</span>
          </div>
          <p className={styles.heroOverline}>
            TypeScript validation-state framework
          </p>
          <h1 className={clsx('hero__title', styles.heroTitle)}>
            Validate what changed.{' '}
            <span className={styles.heroHighlight}>Keep what passed.</span>
          </h1>
          <p className={clsx('hero__subtitle', styles.heroTagline)}>
            Validate only the field or step changing now, retain previous
            results, and prevent stale async responses from corrupting your form
            state.
          </p>
          <div className={styles.ctaGroup}>
            <button
              className={clsx('button button--primary', styles.primaryCta)}
              data-adoption-event="run_demo"
              data-adoption-label="hero_async_race"
              onClick={handleDemoScroll}
              type="button"
            >
              See async race protection
            </button>
            <Link
              className={clsx('button button--secondary', styles.secondaryCta)}
              data-adoption-event="docs_cta"
              data-adoption-label="hero_get_started"
              to="/docs/get_started"
            >
              Get started
            </Link>
            <Link
              className={clsx('button', styles.tertiaryCta)}
              data-adoption-event="docs_cta"
              data-adoption-label="hero_tutorials"
              to="/docs/tutorials"
            >
              Explore tutorials
            </Link>
          </div>
          <div className={styles.capabilityRow} aria-label="Core capabilities">
            <span>Stateful runs</span>
            <span>Stateless server validation</span>
            <span>Standard Schema</span>
          </div>
          <div className={styles.installBar}>
            <code className={styles.installCommand}>{installCommand}</code>
            <button
              type="button"
              className={styles.copyPill}
              data-adoption-event="copy_install"
              data-adoption-label="hero_npm_install"
              onClick={handleCopy}
            >
              <svg
                className={styles.copyIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M9 9V5.5C9 4.672 9.672 4 10.5 4h7C18.328 4 19 4.672 19 5.5v7c0 .828-.672 1.5-1.5 1.5H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="5"
                  y="9"
                  width="9"
                  height="11"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.windowControls} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>registration-suite.ts</span>
            <span className={styles.panelStatus}>Vest 6</span>
          </div>
          <div className={styles.panelBody}>
            <CodeBlock language="javascript" className={styles.panelCode}>
              {heroCode}
            </CodeBlock>
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
      title={`${siteConfig.title}: TypeScript validation-state framework`}
      description="Validate what changed, retain previous results, and prevent stale async responses with Vest."
    >
      <HomepageHeader />
      <main>
        <AsyncRaceDemo />
        <RawExample />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

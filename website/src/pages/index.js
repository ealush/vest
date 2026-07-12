import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';

import Demo from '../components/Demo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';
import Typewriter from '../components/Typewriter';
import { TYPEWRITER_DATA } from '../components/Typewriter/data';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [copied, setCopied] = useState(false);
  const installCommand = 'npm i vest';
  const [[prefix, values], setTypewriterData] = useState(TYPEWRITER_DATA[0]);

  useEffect(() => {
    setTypewriterData(
      TYPEWRITER_DATA[Math.floor(Math.random() * TYPEWRITER_DATA.length)],
    );
  }, []);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const heroCode = `import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'already taken', async () => {
    await doesUsernameExist(data.username);
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
            Form validation that feels like writing tests
          </p>
          <h1 className="hero__title">
            <Typewriter
              prefix={prefix}
              values={values}
              highlightClassName={styles.heroHighlight}
              reservePairs={TYPEWRITER_DATA}
            />
          </h1>
          <p className={clsx('hero__subtitle', styles.heroTagline)}>
            {siteConfig.tagline}
          </p>
          <div className={styles.ctaGroup}>
            <Link
              className={clsx('button button--primary', styles.primaryCta)}
              to="/docs/get_started"
            >
              Get started
            </Link>
            <Link
              className={clsx('button button--secondary', styles.secondaryCta)}
              to="/docs/api_reference"
            >
              Explore the API
            </Link>
            <Link
              className={clsx('button', styles.tertiaryCta)}
              to="/docs/upgrade_guide"
            >
              Try Vest v6
            </Link>
          </div>
          <div className={styles.installBar}>
            <code className={styles.installCommand}>{installCommand}</code>
            <button
              type="button"
              className={styles.copyPill}
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
          <div className={styles.panelHeader}>Complex forms, simplified</div>
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

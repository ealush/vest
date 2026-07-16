import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <img
        className={styles.heroWatermark}
        src="/img/logo.svg"
        alt=""
        aria-hidden="true"
      />
      <div className={styles.heroGrid}>
        <div className={styles.heroContent}>
          <div className={styles.heroBrand}>
            <img src="/img/logo.svg" alt="Vest" className={styles.heroLogo} />
            <span className={styles.heroLogoText}>VEST</span>
            <span className={styles.heroEdition}>06 / validation runtime</span>
          </div>
          <h1 className={clsx('hero__title', styles.heroTitle)}>
            Validation that
            <span className={styles.heroHighlight}> remembers.</span>
          </h1>
          <p className={styles.heroStatement}>
            Your form changes one field at a time. Its validation should too.
          </p>
          <p className={clsx('hero__subtitle', styles.heroTagline)}>
            Vest runs the rules that matter now, retains the truth established
            before, and makes stale async answers irrelevant.
          </p>
          <div className={styles.ctaGroup}>
            <button
              className={clsx('button button--primary', styles.primaryCta)}
              data-adoption-event="run_demo"
              data-adoption-label="hero_async_race"
              onClick={handleDemoScroll}
              type="button"
            >
              Run the async race <span aria-hidden="true">↓</span>
            </button>
            <Link
              className={clsx('button button--secondary', styles.secondaryCta)}
              data-adoption-event="docs_cta"
              data-adoption-label="hero_get_started"
              to="/docs/get_started"
            >
              Read the docs <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.installBar}>
            <span className={styles.prompt} aria-hidden="true">
              $
            </span>
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
          <div className={styles.capabilityRow} aria-label="Core capabilities">
            <span>01 / focused</span>
            <span>02 / stateful</span>
            <span>03 / race-safe</span>
            <span>04 / full-stack</span>
          </div>
        </div>
        <div className={styles.ledger} aria-label="A live Vest suite run">
          <div className={styles.ledgerHeader}>
            <div>
              <span className={styles.ledgerKicker}>LIVE SUITE</span>
              <strong>signup / run 04</strong>
            </div>
            <span className={styles.runState}>RUNNING</span>
          </div>
          <div className={styles.ledgerCommand}>
            <span aria-hidden="true">›</span>
            <code>suite.only('username').run(data)</code>
          </div>
          <div className={styles.fieldLedger}>
            <div className={styles.fieldRow}>
              <span className={styles.fieldNumber}>01</span>
              <div>
                <strong>email</strong>
                <small>from run 03</small>
              </div>
              <span className={styles.retainedState}>RETAINED · VALID</span>
            </div>
            <div className={clsx(styles.fieldRow, styles.activeField)}>
              <span className={styles.fieldNumber}>02</span>
              <div>
                <strong>username</strong>
                <small>request #18</small>
              </div>
              <span className={styles.pendingState}>PENDING</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldNumber}>03</span>
              <div>
                <strong>password</strong>
                <small>from run 02</small>
              </div>
              <span className={styles.retainedState}>RETAINED · VALID</span>
            </div>
          </div>
          <div className={styles.trace}>
            <div>
              <span>12:04:08.214</span>
              <p>
                request #17 <strong>ignored / stale</strong>
              </p>
            </div>
            <div>
              <span>12:04:08.228</span>
              <p>
                previous field state <strong>preserved</strong>
              </p>
            </div>
          </div>
          <div className={styles.ledgerFooter}>
            <code>result.isPending('username')</code>
            <strong>true</strong>
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

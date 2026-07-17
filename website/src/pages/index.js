import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { Highlight, themes } from 'prism-react-renderer';
import React, { useState } from 'react';

import AsyncRaceDemo from '../components/AsyncRaceDemo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';

import styles from './index.module.css';

const HeroSuiteCode = `import { create, enforce, test } from 'vest';

const signupSuite = create(data => {
  test('email', 'Enter a valid email', () => {
    enforce(data.email).matches(/^\\S+@\\S+\\.\\S+$/);
  });

  test('username', 'Username is taken', async ({ signal }) => {
    const available = await isUsernameAvailable(data.username, signal);
    enforce(available).isTruthy();
  });

  test('password', 'Use at least 8 characters', () => {
    enforce(data.password).longerThanOrEquals(8);
  });
});

export default signupSuite;`;

function HomepageHeader() {
  const [copied, setCopied] = useState(false);
  const [ledgerView, setLedgerView] = useState('run');
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

  const handleLedgerTabKeyDown = event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const views = ['run', 'suite'];
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const currentIndex = views.indexOf(ledgerView);
    const nextView =
      views[(currentIndex + direction + views.length) % views.length];

    setLedgerView(nextView);
    event.currentTarget.parentElement
      ?.querySelector(`#ledger-${nextView}-tab`)
      ?.focus();
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
            Validation
            <span className={styles.heroHighlight}> like unit tests.</span>
          </h1>
          <p className={styles.heroStatement}>
            Your form changes one field at a time. Its validation should too.
          </p>
          <p className={clsx('hero__subtitle', styles.heroTagline)}>
            Run the rules for the field that changed. Keep the other results.
            Ignore async responses that arrived too late.
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
            <div className={styles.ledgerMeta}>
              <span className={styles.ledgerKicker}>LIVE SUITE</span>
              <strong>
                signup / {ledgerView === 'run' ? 'run 04' : 'suite.js'}
              </strong>
            </div>
            <div
              className={styles.ledgerTabs}
              role="tablist"
              aria-label="Live suite view"
            >
              <button
                aria-controls="ledger-run-panel"
                aria-selected={ledgerView === 'run'}
                className={styles.ledgerTab}
                id="ledger-run-tab"
                onClick={() => setLedgerView('run')}
                onKeyDown={handleLedgerTabKeyDown}
                role="tab"
                tabIndex={ledgerView === 'run' ? 0 : -1}
                type="button"
              >
                RUN
              </button>
              <button
                aria-controls="ledger-suite-panel"
                aria-selected={ledgerView === 'suite'}
                className={styles.ledgerTab}
                id="ledger-suite-tab"
                onClick={() => setLedgerView('suite')}
                onKeyDown={handleLedgerTabKeyDown}
                role="tab"
                tabIndex={ledgerView === 'suite' ? 0 : -1}
                type="button"
              >
                SUITE
              </button>
            </div>
          </div>
          {ledgerView === 'run' ? (
            <div
              aria-labelledby="ledger-run-tab"
              className={styles.ledgerPanel}
              id="ledger-run-panel"
              role="tabpanel"
              tabIndex={0}
            >
              <div className={styles.ledgerCommand}>
                <span aria-hidden="true">›</span>
                <code>signupSuite.only('username').run(data)</code>
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
          ) : (
            <div
              aria-labelledby="ledger-suite-tab"
              className={clsx(styles.ledgerPanel, styles.codePanel)}
              id="ledger-suite-panel"
              role="tabpanel"
              tabIndex={0}
            >
              <Highlight
                code={HeroSuiteCode}
                language="javascript"
                theme={themes.vsDark}
              >
                {({ getLineProps, getTokenProps, tokens }) => (
                  <pre className={styles.suiteCode}>
                    {tokens.map((line, lineIndex) => {
                      const lineProps = getLineProps({ line });

                      return (
                        <div
                          key={lineIndex}
                          {...lineProps}
                          className={clsx(lineProps.className, styles.codeLine)}
                        >
                          <span className={styles.codeLineNumber}>
                            {String(lineIndex + 1).padStart(2, '0')}
                          </span>
                          <span>
                            {line.map((token, tokenIndex) => (
                              <span
                                key={tokenIndex}
                                {...getTokenProps({ token })}
                              />
                            ))}
                          </span>
                        </div>
                      );
                    })}
                  </pre>
                )}
              </Highlight>
              <div className={styles.codeNote}>
                <span>FOCUSED RUN</span>
                <code>signupSuite.only('username').run(data)</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}: Form validation written like unit tests`}
      description="Validate what changed, keep previous results, and ignore stale async responses with Vest."
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

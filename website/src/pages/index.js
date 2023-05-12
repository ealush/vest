import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import GithubLogo from '../../static/img/github.svg';
import LogoSvg from '../../static/img/logo.svg';
import Demo from '../components/Demo';
import HomepageFeatures from '../components/HomepageFeatures';
import RawExample from '../components/RawExample';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero__primary', styles.heroBanner)}>
      <div className={styles.logoContainer}>
        <LogoSvg className={styles.vestLogo} />
      </div>
      <div className={styles.titleContainer}>
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className={clsx('hero__subtitle', styles.heroTagline)}>
          <span>{siteConfig.tagline}</span>
        </p>
      </div>
      <div className={styles.buttons}>
        <Link
          className={clsx('button', styles.btn, styles.btnQuickStart)}
          to="/docs/get_started"
        >
          Quick Start Guide
        </Link>
        <Link
          className={clsx('button', styles.btn, styles.btnGit)}
          to="https://github.com/ealush/vest"
        >
          <GithubLogo
            style={{ height: '22px', marginRight: '0.5rem', float: 'left' }}
          />
          Github
        </Link>
      </div>
      <div className={styles.buttons}>
        <Link
          className={clsx('button', styles.btn, styles.btnPromote)}
          to="/vest-5-is-ready"
        >
          Try The New Version!
        </Link>
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

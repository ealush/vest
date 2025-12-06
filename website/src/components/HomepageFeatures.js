import clsx from 'clsx';
import React from 'react';

import commonStyles from './Common.module.css';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Test-inspired syntax',
    tag: 'DX',
    description:
      'Write validations that read like unit tests. Vest keeps assertions predictable so teams can onboard quickly.',
  },
  {
    title: 'Framework agnostic',
    tag: 'Interop',
    description:
      'Drop Vest into any stack—React, Vue, Svelte, Angular, or vanilla. Keep your UI while Vest orchestrates validation logic.',
  },
  {
    title: 'Async-ready & stateful',
    tag: 'Reliability',
    description:
      'Handle async flows, reuse suites, and let Vest manage the state machinery so you can focus on user experience.',
  },
  {
    title: 'Extendable by design',
    tag: 'Composable',
    description:
      'Add custom rules or suite patterns without rewriting your forms. Vest stays tiny while remaining flexible.',
  },
  {
    title: 'Tiny footprint',
    tag: 'Performance',
    description:
      'Zero runtime dependencies and only a few KB gzipped—ideal for teams chasing fast startups and lean bundles.',
  },
  {
    title: 'Batteries included',
    tag: 'Productivity',
    description:
      'From enforce rules to helpful errors, Vest ships sensible defaults that reduce boilerplate across your product.',
  },
];

function Feature({ title, tag, description }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureMeta}>
        <span className={styles.cardTag}>{tag}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
      </div>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={clsx(styles.features, commonStyles.main_section_centered)}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Why Vest</span>
          <h2 className={styles.sectionTitle}>Ship stable forms without boilerplate</h2>
          <p className={styles.sectionLead}>
            A declarative, test-like API that stays framework agnostic, handles async with grace,
            and keeps bundles lean.
          </p>
        </div>
        <div className={styles.grid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

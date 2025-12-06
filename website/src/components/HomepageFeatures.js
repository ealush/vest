import clsx from 'clsx';
import React from 'react';

import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Unit test mindset',
    emoji: '🧪',
    subtitle: 'Declarative suites built like specs',
    description:
      'Write validations with the same ergonomics as your favorite testing library—clear assertions, readable suites, and predictable runs.',
    bullets: ['Familiar describe/it flow', 'Deterministic orchestration', 'Readable failures'],
  },
  {
    title: 'Framework agnostic',
    emoji: '🔌',
    subtitle: 'Drop into any stack',
    description:
      'Use Vest with React, Vue, Svelte, or vanilla JS. Keep your UI agnostic while sharing validation logic across apps.',
    bullets: ['No UI dependencies', 'Composable rules', 'Shareable between projects'],
  },
  {
    title: 'Production-ready',
    emoji: '🚀',
    subtitle: 'Async safe and lightweight',
    description:
      'Handle async flows confidently with built-in orchestration while keeping bundles lean and dependency-free.',
    bullets: ['Async-first primitives', 'Tiny footprint', 'Type-safe APIs'],
  },
];

function Feature({ emoji, title, subtitle, description, bullets }) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.cardHeader}>
          <span className={styles.emoji}>{emoji}</span>
          <div>
            <p className={styles.featureSubtitle}>{subtitle}</p>
            <h3 className={styles.featureTitle}>{title}</h3>
          </div>
        </div>
        <p className={styles.featureDescription}>{description}</p>
        <ul className={styles.featureList}>
          {bullets.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Why teams choose Vest</p>
          <h2 className={styles.sectionTitle}>Reliable validations without the ceremony</h2>
          <p className={styles.sectionLead}>
            Vest keeps validations simple, expressive, and portable—so you can
            ship confidently without rewriting business logic for every stack.
          </p>
        </div>
        <div className="row">
          {FeatureList.map(feature => (
            <Feature key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

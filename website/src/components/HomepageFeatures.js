import clsx from 'clsx';
import React from 'react';

import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Easy to learn',
    emoji: '💡',
    description:
      'Vest mirrors the syntax of unit testing frameworks, so you write validations with familiar describe/test ergonomics.',
  },
  {
    title: 'Framework agnostic',
    emoji: '🎨',
    description:
      'Use Vest with any UI stack you like. It stays focused on validation logic while you bring your own components.',
  },
  {
    title: 'Smart runtime',
    emoji: '🧠',
    description:
      'Async handling, state management, and dependency-aware reruns are built in so validations stay fast and predictable.',
  },
  {
    title: 'Extensible',
    emoji: '🧩',
    description:
      'Craft custom validation types and behaviors that fit your domain without fighting the framework.',
  },
  {
    title: 'Reusable',
    emoji: '♻️',
    description: 'Share validation logic across forms and features to keep your UX consistent and maintainable.',
  },
  {
    title: 'Tiny footprint',
    emoji: '🐜',
    description: 'Zero dependencies and a few kilobytes of code keep bundles lean and pages speedy.',
  },
];

function Feature({ emoji, title, description }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.cardTop}>
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
      </div>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <p className={styles.kicker}>Why Vest</p>
          <h2 className={styles.sectionTitle}>Validation that feels like testing</h2>
          <p className={styles.sectionLead}>
            Design suites the way you design specs: readable, declarative, and ready to ship across any frontend stack.
          </p>
        </div>
        <div className={clsx('row', styles.grid)}>
          {FeatureList.map((props, idx) => (
            <div key={idx} className={clsx('col col--4', styles.gridItem)}>
              <Feature {...props} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

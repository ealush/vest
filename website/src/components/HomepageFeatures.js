import clsx from 'clsx';
import React from 'react';
import commonStyles from './Common.module.css';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Declarative by design',
    emoji: '🧾',
    category: 'DX',
    description:
      'Author validations like unit tests with suites, hooks, and familiar assertions.',
  },
  {
    title: 'Framework agnostic',
    emoji: '🌐',
    category: 'Flexible',
    description: 'Use Vest anywhere—React, Vue, Svelte, vanilla JS, or your favorite stack.',
  },
  {
    title: 'Async ready',
    emoji: '⚡️',
    category: 'Performance',
    description: 'Handle async flows out of the box with deterministic state management.',
  },
  {
    title: 'Extendable core',
    emoji: '🧩',
    category: 'Composable',
    description: 'Add custom validation rules and share suites across teams with ease.',
  },
  {
    title: 'Tiny footprint',
    emoji: '🎯',
    category: 'Shipping',
    description: 'Zero dependencies and a few KBs—perfect for modern, lean bundles.',
  },
  {
    title: 'Test-like ergonomics',
    emoji: '✅',
    category: 'Productivity',
    description: 'Readable error messages, deterministic runs, and intuitive APIs.',
  },
];

function Feature({ emoji, title, category, description }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureHeader}>
        <span className={styles.emoji}>{emoji}</span>
        <span className={styles.category}>{category}</span>
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={clsx(styles.features, commonStyles.main_section_centered)}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Built for modern DX</p>
          <h2 className={styles.sectionTitle}>Everything you need to trust your forms</h2>
          <p className={styles.sectionDescription}>
            Vest pairs a lightweight core with a familiar testing-inspired API, so you can ship
            confident experiences without fighting your validation layer.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FeatureList.map((feature) => (
            <Feature key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

import clsx from 'clsx';
import React from 'react';
import commonStyles from './Common.module.css';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Testing syntax',
    emoji: '🧪',
    category: 'Familiar',
    description:
      'Write validations using test() and enforce()—declarative syntax you already know from Mocha or Jest.',
  },
  {
    title: 'Use it anywhere',
    emoji: '🌐',
    category: 'Portable',
    description:
      'Framework agnostic. Works seamlessly with React, Vue, Svelte, or vanilla JS. Fully compatible with Standard Schema.',
  },
  {
    title: 'Async by default',
    emoji: '⚡️',
    category: 'Resilient',
    description:
      'Handle server checks and promises natively. Vest tracks pending states and prevents race conditions automatically.',
  },
  {
    title: 'Fully typed',
    emoji: '📘',
    category: 'TypeScript',
    description:
      'First-class TypeScript support. Define your data shape once and enjoy full type inference and autocomplete across your suite.',
  },
  {
    title: 'Zero external dependencies',
    emoji: '🪶',
    category: 'Lightweight',
    description:
      'Built on a modular architecture of internal micro-packages. No third-party bloat, no supply chain surprises.',
  },
  {
    title: 'Smart state',
    emoji: '🧠',
    category: 'Stateful',
    description:
      'Vest remembers previous runs and merges results, allowing you to validate only the fields the user is interacting with.',
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
    <section
      className={clsx(styles.features, commonStyles.main_section_centered)}
    >
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>
            Designed for the way you build
          </p>
          <h2 className={styles.sectionTitle}>
            A complete toolkit for form sanity
          </h2>
          <p className={styles.sectionDescription}>
            Vest combines a familiar testing syntax with a smart, stateful core.
            It manages pending async tests, field focus, and strict type safety
            so you don't have to.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FeatureList.map(feature => (
            <Feature key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from '@docusaurus/Link';
import clsx from 'clsx';
import React from 'react';
import commonStyles from './Common.module.css';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Run only what changed',
    emoji: '◎',
    category: 'Focused',
    description:
      'Validate the active field, step, or group without rerunning unrelated rules or showing errors on untouched inputs.',
  },
  {
    title: 'Keep what already passed',
    emoji: '↺',
    category: 'Stateful',
    description:
      'Each focused run updates the same result, so fields you did not run keep their previous status.',
  },
  {
    title: 'Trust the latest response',
    emoji: '⇄',
    category: 'Race-safe',
    description:
      'Track pending work, cancel old requests, and stop a slow response from replacing the result for the current value.',
  },
  {
    title: 'Model real workflows',
    emoji: '⌘',
    category: 'Dependent',
    description:
      'Express linked fields, conditional sections, warnings, optional values, multi-step groups, and dynamic lists.',
  },
  {
    title: 'Continue across boundaries',
    emoji: '↗',
    category: 'Full stack',
    description:
      'Run each server request in isolation, restore its result in the browser, and share the same suite across frameworks.',
  },
  {
    title: 'Write rules like tests',
    emoji: '✓',
    category: 'Maintainable',
    description:
      'Keep rules in readable suites outside your components, then unit-test and reuse them like any other code.',
  },
];

function Feature({ emoji, title, category, description, index }) {
  return (
    <article className={styles.featureRow}>
      <span className={styles.featureIndex}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <div className={styles.featureHeading}>
        <span className={styles.category}>{category}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
      </div>
      <p className={styles.featureDescription}>{description}</p>
    </article>
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
            Built for validation over time
          </p>
          <h2 className={styles.sectionTitle}>
            Run less. Keep the full result.
          </h2>
          <p className={styles.sectionDescription}>
            A suite remembers what ran, what passed, what is pending, and which
            async response belongs to the current value.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FeatureList.map((feature, index) => (
            <Feature key={feature.title} index={index} {...feature} />
          ))}
        </div>
        <div className={styles.positioningBand}>
          <div>
            <span className={styles.positioningLabel}>At the boundary</span>
            <strong>Enforce parses and transforms submitted payloads.</strong>
            <p>Use Vest end to end, or bring another Standard Schema tool.</p>
          </div>
          <span className={styles.positioningPlus}>+</span>
          <div>
            <span className={styles.positioningLabel}>During interaction</span>
            <strong>Vest manages how validity changes over time.</strong>
            <p>
              Use it as values change, async work overlaps, and steps unfold.
            </p>
          </div>
        </div>
        <div className={styles.nextStep}>
          <div>
            <span className={styles.positioningLabel}>Learn Vest</span>
            <h3>Start with the problem you are trying to solve.</h3>
            <p>
              Write a first suite, handle async checks, parse typed input, or
              share validation between the browser and server.
            </p>
          </div>
          <Link
            className="button button--primary button--lg"
            to="/docs/tutorials"
          >
            Browse the tutorials <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

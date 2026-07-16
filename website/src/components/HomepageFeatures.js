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
      'Validate the active field, step, or group without rerunning unrelated rules or exposing errors for untouched inputs.',
  },
  {
    title: 'Keep what already passed',
    emoji: '↺',
    category: 'Stateful',
    description:
      'Vest merges each focused run into a living result, preserving trustworthy validation state from earlier interactions.',
  },
  {
    title: 'Trust the latest response',
    emoji: '⇄',
    category: 'Race-safe',
    description:
      'Track pending work, cancel obsolete requests, and prevent slow stale responses from replacing the current result.',
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
      'Run statelessly on the server, resume validation state in the browser, or share one suite across UI frameworks.',
  },
  {
    title: 'Write rules like tests',
    emoji: '✓',
    category: 'Maintainable',
    description:
      'Keep business rules outside feature code in readable suites that are straightforward to unit-test and reuse.',
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
            A runtime for validation over time
          </p>
          <h2 className={styles.sectionTitle}>
            The complete picture, without repeating all the work
          </h2>
          <p className={styles.sectionDescription}>
            A suite is a living validation result. It knows what ran, what can
            be retained, what is pending, and which result is still relevant.
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
            <span className={styles.positioningLabel}>Learn by solving</span>
            <h3>Start with the validation problem you already have.</h3>
            <p>
              Ten practical tutorials move from a first suite to async state,
              typed schemas, and browser/server continuity.
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

import clsx from 'clsx';
import React from 'react';
import commonStyles from './Common.module.css';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Easy to learn',
    emoji: '💡',
    description: (
      <>
        Vest adopts the syntax and style of unit testing frameworks, so you can
        leverage the knowledge you already have to write your form validations.
      </>
    ),
  },
  {
    title: 'Framework Agnostic',
    emoji: '🎨',
    description: (
      <>
        Bring your own UI. Vest is framework agnostic, so you can use it with
        any UI framework you have.
      </>
    ),
  },
  {
    title: 'Really smart',
    emoji: '🧠',
    description: (
      <>
        Vest takes care of all the annoying parts for you. It manages its own
        state, handles async validations and much more.
      </>
    ),
  },
  {
    title: 'Extendable',
    emoji: '🧩',
    description: (
      <>
        You can easily add new custom types of validations to Vest according to
        your needs.
      </>
    ),
  },
  {
    title: 'Reusable',
    emoji: '♻️',
    description: (
      <>
        Validation logic in Vest can be shared across multiple features in your
        app.
      </>
    ),
  },
  {
    title: 'Tiny',
    emoji: '🐜',
    description: (
      <>
        Packed with features, but optimized for size. Vest brings no
        dependencies, and only takes a few KBs.
      </>
    ),
  },
];

function Feature({ emoji, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.emoji}>{emoji}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <>
      <section
        className={clsx(styles.features, commonStyles.main_section_centered)}
      >
        <div className="container">
          <div className="row">
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

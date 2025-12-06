import CodeBlock from '@theme/CodeBlock';
import clsx from 'clsx';
import React from 'react';
import commonStyles from './Common.module.css';
import styles from './RawExample.module.css';

export default () => {
  return (
    <section
      className={clsx(styles.section, commonStyles.main_section_centered)}
    >
      <p className={styles.desc}>
        <strong>
          Vest looks and feels like a unit testing framework, but for your
          forms.
        </strong>
        <br />
        By separating validation logic from your UI, you get a system that
        handles async checks, dependent fields, and conditional logic without
        cluttering your component state.
      </p>
      <div className={styles.codeWindow}>
        <div className={styles.windowHeader}>
          <div className={clsx(styles.dot, styles.red)} />
          <div className={clsx(styles.dot, styles.yellow)} />
          <div className={clsx(styles.dot, styles.green)} />
          <span className={styles.fileName}>validation.js</span>
        </div>
        <CodeBlock className={clsx('language-js', styles.codeBlock)}>{`
import { create, test, enforce } from 'vest';

const suite = create((data) => {
  test("username", "Username is required", () => {
    enforce(data.username).isNotBlank();
  });

  test("username", "Username must be at least 3 chars", () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('username', 'Username already taken', async () => {
    await doesUserExist(data.username);
  });
});

export default suite;
`}</CodeBlock>
      </div>
    </section>
  );
};

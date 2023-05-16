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
        Vest looks and feels like a unit testing framework, but is fully
        optimized for production use.
        <br />
        It allows you to express your validation logic in a simple and readable
        way that's also easy to maintain in the long run.
      </p>
      <CodeBlock className={clsx('language-js', styles.code)}>{`
test("username", "Username is required", () => {
  enforce(data.username).isNotBlank();
});

test("username", "Username must be at least 3 chars", () => {
  enforce(data.username).longerThanOrEquals(3);
});

test('username', 'Username already taken', async () => {
  await doesUserExist(data.username);
});
`}</CodeBlock>
    </section>
  );
};

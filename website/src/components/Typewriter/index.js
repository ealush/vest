import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const TYPING_SPEED_MIN = 30;
const TYPING_SPEED_MAX = 70;
const DELETING_SPEED = 30;
const PAUSE_BEFORE_DELETE = 2000;
const PAUSE_BEFORE_TYPE = 500;
const PAUSE_AFTER_PREFIX = 500;

export default function Typewriter({
  prefix = '',
  values = [],
  highlightClassName = '',
}) {
  const [phase, setPhase] = useState('typing-prefix');
  // Phases:
  // 'typing-prefix', 'paused-after-prefix',
  // 'typing-value', 'paused-before-delete',
  // 'deleting-value', 'paused-before-type'

  const [displayedPrefix, setDisplayedPrefix] = useState('');
  const [displayedValue, setDisplayedValue] = useState('');
  const [valueIndex, setValueIndex] = useState(0);

  useEffect(() => {
    let delay = 50;

    // Determine delay and next action based on state
    switch (phase) {
      case 'typing-prefix':
        delay =
          Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN) +
          TYPING_SPEED_MIN;
        break;
      case 'paused-after-prefix':
        delay = PAUSE_AFTER_PREFIX;
        break;
      case 'typing-value':
        delay =
          Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN) +
          TYPING_SPEED_MIN;
        break;
      case 'paused-before-delete':
        delay = PAUSE_BEFORE_DELETE;
        break;
      case 'deleting-value':
        delay = DELETING_SPEED;
        break;
      case 'paused-before-type':
        delay = PAUSE_BEFORE_TYPE;
        break;
      default:
        break;
    }

    const handleTick = () => {
      const currentFullValue = values[valueIndex];

      switch (phase) {
        case 'typing-prefix':
          if (displayedPrefix.length < prefix.length) {
            setDisplayedPrefix(prefix.substring(0, displayedPrefix.length + 1));
          } else {
            setPhase('paused-after-prefix');
          }
          break;

        case 'paused-after-prefix':
          setPhase('typing-value');
          break;

        case 'typing-value':
          if (displayedValue.length < currentFullValue.length) {
            setDisplayedValue(
              currentFullValue.substring(0, displayedValue.length + 1),
            );
          } else {
            setPhase('paused-before-delete');
          }
          break;

        case 'paused-before-delete':
          setPhase('deleting-value');
          break;

        case 'deleting-value':
          if (displayedValue.length > 0) {
            setDisplayedValue(
              currentFullValue.substring(0, displayedValue.length - 1),
            );
          } else {
            setPhase('paused-before-type');
            setValueIndex(prev => (prev + 1) % values.length);
          }
          break;

        case 'paused-before-type':
          setPhase('typing-value');
          break;

        default:
          break;
      }
    };

    const timer = setTimeout(handleTick, delay);
    return () => clearTimeout(timer);
  }, [phase, displayedPrefix, displayedValue, valueIndex, prefix, values]);

  // Cursor Visibility Logic
  // We want the cursor to appear after the last typed character.
  // During prefix typing: Cursor at end of prefix.
  // During value typing: Cursor at end of value.

  const showPrefixCursor = phase === 'typing-prefix';

  // Show value cursor in all other phases, except when we are waiting to start typing the prefix? (not applicable here)
  // or maybe when we are transitioning?
  const showValueCursor = !showPrefixCursor;

  // Blinking:
  // Blink when paused.
  const isBlinking =
    phase === 'paused-after-prefix' ||
    phase === 'paused-before-delete' ||
    phase === 'paused-before-type' ||
    (phase === 'typing-value' && displayedValue.length === 0); // Blink while waiting to start typing value

  return (
    <>
      {displayedPrefix}
      {showPrefixCursor && (
        <span className={clsx(styles.cursor, { [styles.blinking]: false })}>
          |
        </span>
      )}
      <br />
      <span className={highlightClassName}>
        {displayedValue}
        {showValueCursor && (
          <span
            className={clsx(styles.cursor, { [styles.blinking]: isBlinking })}
          >
            |
          </span>
        )}
      </span>
    </>
  );
}

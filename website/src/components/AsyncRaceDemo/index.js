import clsx from 'clsx';
import React, { useRef, useState } from 'react';

import { createSignupSuite, getSimulatedDelay, RACE_STEPS } from './suite';
import styles from './styles.module.css';

const INITIAL_FORM = { email: '', username: '' };
const DEMO_EMAIL = 'dev@vest.dev';
const pause = delayMs =>
  new Promise(resolve => window.setTimeout(resolve, delayMs));

export default function AsyncRaceDemo() {
  const [activity, setActivity] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isRunning, setIsRunning] = useState(false);
  const [lastFocused, setLastFocused] = useState(null);
  const [, setRevision] = useState(0);
  const completionOrder = useRef(0);
  const generation = useRef(0);
  const requestCounter = useRef(0);
  const suiteRef = useRef(null);

  const refresh = () => setRevision(revision => revision + 1);

  if (!suiteRef.current) {
    suiteRef.current = createSignupSuite({
      onRequestStart: request => {
        if (request.generation !== generation.current) return;

        setActivity(current => [...current, { ...request, status: 'pending' }]);
      },
      onRequestComplete: request => {
        if (request.generation !== generation.current) return;

        completionOrder.current += 1;
        setActivity(current =>
          current.map(item =>
            item.id === request.id
              ? {
                  ...item,
                  ...request,
                  completionOrder: completionOrder.current,
                  status: request.stale ? 'ignored' : 'applied',
                }
              : item,
          ),
        );
      },
    });
  }

  const suite = suiteRef.current;
  const result = suite.get();
  const emailIsRetained = lastFocused === 'username' && result.isValid('email');
  const pendingCount = activity.filter(
    request => request.status === 'pending',
  ).length;

  function runField(fieldName, nextForm, request = {}) {
    setLastFocused(fieldName);
    const run = suite
      .only(fieldName)
      .afterEach(refresh)
      .run({ ...nextForm, ...request });

    refresh();
    return run;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (name === 'username') {
      requestCounter.current += 1;
      runField(name, nextForm, {
        delayMs: getSimulatedDelay(value),
        generation: generation.current,
        requestId: requestCounter.current,
      });
    } else {
      runField(name, nextForm);
    }
  }

  async function runRace() {
    if (isRunning) return;

    generation.current += 1;
    completionOrder.current = 0;
    requestCounter.current = 0;
    suite.reset();
    setActivity([]);
    setIsRunning(true);

    let nextForm = { email: DEMO_EMAIL, username: '' };
    setForm(nextForm);
    runField('email', nextForm);
    await pause(260);

    const raceStartedAt = Date.now();
    let latestRun;
    for (const [index, step] of RACE_STEPS.entries()) {
      requestCounter.current += 1;
      nextForm = { ...nextForm, username: step.username };
      setForm(nextForm);
      latestRun = runField('username', nextForm, {
        ...step,
        generation: generation.current,
        requestId: requestCounter.current,
      });

      if (index < RACE_STEPS.length - 1) await pause(210);
    }

    await Promise.resolve(latestRun);

    const lastResponseAt = Math.max(
      ...RACE_STEPS.map((step, index) => step.delayMs + index * 210),
    );
    const elapsed = Date.now() - raceStartedAt;
    await pause(Math.max(0, lastResponseAt - elapsed + 80));

    refresh();
    setIsRunning(false);
  }

  function fieldState(fieldName) {
    if (result.isPending(fieldName)) return 'pending';
    if (result.hasErrors(fieldName)) return 'error';
    if (result.isValid(fieldName)) return 'valid';
    return 'idle';
  }

  const emailState = fieldState('email');
  const usernameState = fieldState('username');

  return (
    <section id="async-race-demo" className={styles.section}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>See stateful validation happen</p>
        <h2>When the network answers in the wrong order</h2>
        <p>
          Three username checks race. Vest applies the current answer, ignores
          stale responses, and keeps the email result that did not run again.
        </p>
      </div>

      <div className={styles.demoShell}>
        <div className={styles.formPanel}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.stepLabel}>Workspace setup</span>
              <h3>Create your account</h3>
            </div>
            <span className={styles.secureBadge}>Live Vest suite</span>
          </div>

          <form onSubmit={event => event.preventDefault()}>
            <Field
              label="Work email"
              name="email"
              onChange={handleChange}
              placeholder="you@company.com"
              state={emailState}
              value={form.email}
              message={
                emailIsRetained
                  ? 'Valid · retained from the earlier run'
                  : getFieldMessage(result, 'email', emailState)
              }
            />

            <Field
              label="Username"
              name="username"
              onChange={handleChange}
              placeholder="Choose a username"
              state={usernameState}
              value={form.username}
              message={getFieldMessage(result, 'username', usernameState)}
            />

            <button
              className={styles.runButton}
              data-adoption-event="run_demo"
              data-adoption-label="async_race_interactive"
              disabled={isRunning}
              onClick={runRace}
              type="button"
            >
              <span className={styles.playIcon} aria-hidden="true">
                ▶
              </span>
              {isRunning ? 'Race in progress…' : 'Run the race condition demo'}
            </button>
          </form>

          <div className={styles.focusSummary} aria-live="polite">
            <span className={styles.focusDot} />
            {lastFocused === 'username' ? (
              <span>
                Ran <code>username</code> only
                {emailIsRetained && (
                  <>
                    {' '}
                    · retained <code>email</code>
                  </>
                )}
              </span>
            ) : (
              <span>Focused runs validate only the field that changed</span>
            )}
          </div>
        </div>

        <div className={styles.activityPanel}>
          <div className={styles.activityHeader}>
            <div>
              <span className={styles.stepLabel}>Validation activity</span>
              <h3>Request timeline</h3>
            </div>
            <span
              className={clsx(styles.pendingBadge, {
                [styles.pendingBadgeActive]: pendingCount > 0,
              })}
            >
              {pendingCount} pending
            </span>
          </div>

          <div className={styles.timeline} aria-live="polite">
            {activity.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>↯</span>
                <strong>Ready to create a race</strong>
                <span>
                  Watch requests finish out of order while the form stays
                  correct.
                </span>
              </div>
            ) : (
              activity.map(request => (
                <RequestRow key={request.id} request={request} />
              ))
            )}
          </div>

          <div className={styles.activityFooter}>
            <span className={styles.vestMark}>V</span>
            <span>
              Vest validates what changed and protects the state you already
              earned.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, message, name, onChange, placeholder, state, value }) {
  return (
    <label className={styles.field}>
      <span className={styles.labelRow}>
        <span>{label}</span>
        <Status state={state} />
      </span>
      <input
        aria-describedby={`${name}-status`}
        className={clsx(styles.input, styles[`input_${state}`])}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck="false"
        type={name === 'email' ? 'email' : 'text'}
        value={value}
      />
      <span
        className={clsx(styles.fieldMessage, styles[`message_${state}`])}
        id={`${name}-status`}
      >
        {message}
      </span>
    </label>
  );
}

function Status({ state }) {
  const labels = {
    error: 'Needs attention',
    idle: 'Not checked',
    pending: 'Checking…',
    valid: 'Validated',
  };

  return (
    <span className={clsx(styles.status, styles[`status_${state}`])}>
      <span className={styles.statusIcon} aria-hidden="true">
        {state === 'valid' ? '✓' : state === 'error' ? '!' : '•'}
      </span>
      {labels[state]}
    </span>
  );
}

function RequestRow({ request }) {
  const isPending = request.status === 'pending';
  const isIgnored = request.status === 'ignored';

  return (
    <div className={clsx(styles.request, styles[`request_${request.status}`])}>
      <span className={styles.requestRail} aria-hidden="true">
        {isPending ? <span className={styles.spinner} /> : '✓'}
      </span>
      <div className={styles.requestMain}>
        <div className={styles.requestTitle}>
          <strong>Request #{request.id}</strong>
          <code>“{request.username}”</code>
        </div>
        <span className={styles.requestMeta}>
          {isPending
            ? `Simulated ${request.delayMs}ms response`
            : `Completed ${ordinal(request.completionOrder)}`}
        </span>
      </div>
      <span className={styles.requestOutcome}>
        {isPending
          ? 'pending'
          : isIgnored
            ? 'ignored as stale'
            : request.available
              ? 'valid · applied'
              : 'error · applied'}
      </span>
    </div>
  );
}

function getFieldMessage(result, fieldName, state) {
  if (state === 'pending') return 'Waiting for the latest response';
  if (state === 'error') return result.getError(fieldName);
  if (state === 'valid') return 'Current value is valid';
  return 'Validation will run when this field changes';
}

function ordinal(number) {
  if (number === 1) return '1st';
  if (number === 2) return '2nd';
  if (number === 3) return '3rd';
  return `${number}th`;
}

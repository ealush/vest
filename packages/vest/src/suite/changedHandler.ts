/** The opt-in relationships entry installs the planner used by changed(). */
type Modifiers = {
  changed?: string | readonly string[];
  only?: unknown;
  skip?: unknown;
};

export type ChangedRun<M> = {
  /** The modifiers reported as the run's focus: the selected fields. */
  focus: M;
  /**
   * The modifiers the run executes with: `only` runs exactly the selected
   * user tests, and `schemaFocus` names schema failures to report outside it.
   */
  runModifiers: M;
  schemaRunResult?: Array<{
    pass: boolean;
    message?: string;
    path?: readonly string[];
    type?: unknown;
  }>;
  evaluated: ((path: readonly string[] | undefined) => boolean) | null;
  /** Parsed output of the validated fields, when it differs from schemaRunResult. */
  value?: unknown;
};

// The planner builds the run's modifiers itself, so this code stays out of
// the core bundle.
type Handler = <M extends Modifiers>(
  schema: unknown,
  data: unknown,
  modifiers: M,
) => ChangedRun<M>;

export let planChanged: Handler = () => {
  throw new Error(
    "suite.changed() needs: import 'vest/relationships' (same module format as vest)",
  );
};

export function installChangedHandler(value: Handler): void {
  planChanged = value;
}

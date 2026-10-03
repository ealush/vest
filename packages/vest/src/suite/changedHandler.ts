/** The opt-in relationships entry installs the planner used by changed(). */
export type ChangedPlan = {
  only: string[];
  schemaResults?: Array<{
    pass: boolean;
    message?: string;
    path?: readonly string[];
    type?: unknown;
  }>;
  evaluated: ((path: readonly string[] | undefined) => boolean) | null;
};

type Handler = (
  schema: unknown,
  fields: readonly string[],
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
) => ChangedPlan;

export let planChanged: Handler = () => {
  throw new Error("suite.changed() needs: import 'vest/relationships'");
};

export function installChangedHandler(value: Handler): void {
  planChanged = value;
}

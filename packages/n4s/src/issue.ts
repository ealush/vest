export type IssueConfig = {
  code: string;
  message: string;
};

export type EnforceIssue = IssueConfig & {
  meta: Readonly<Record<string, unknown>>;
  path?: ReadonlyArray<string | number>;
};

export type RuleDescriptor = {
  args: readonly unknown[];
  issue?: IssueConfig;
  rule: string;
};

export function deriveIssueMeta(
  descriptor: RuleDescriptor,
  value: unknown,
): Readonly<Record<string, unknown>> {
  const constraint = deriveConstraint(descriptor.rule, descriptor.args);
  const actual = describeActual(value);

  return {
    rule: descriptor.rule,
    ...constraint,
    ...(actual === undefined ? {} : { actual }),
  };
}

function deriveConstraint(
  rule: string,
  args: readonly unknown[],
): Record<string, unknown> {
  return constraintDerivers[rule]?.(args) ?? {};
}

const minimumExclusive = ([minimum]: readonly unknown[]) => ({
  inclusive: false,
  minimum,
});
const minimumInclusive = ([minimum]: readonly unknown[]) => ({
  inclusive: true,
  minimum,
});
const maximumExclusive = ([maximum]: readonly unknown[]) => ({
  inclusive: false,
  maximum,
});
const maximumInclusive = ([maximum]: readonly unknown[]) => ({
  inclusive: true,
  maximum,
});

const constraintDerivers: Record<
  string,
  (args: readonly unknown[]) => Record<string, unknown>
> = {
  greaterThan: minimumExclusive,
  greaterThanOrEquals: minimumInclusive,
  gt: minimumExclusive,
  gte: minimumInclusive,
  isBetween: ([minimum, maximum]) => ({
    inclusive: true,
    maximum,
    minimum,
  }),
  lengthEquals: ([length]) => ({ length }),
  lengthNotEquals: ([disallowedLength]) => ({ disallowedLength }),
  lessThan: maximumExclusive,
  lessThanOrEquals: maximumInclusive,
  longerThan: minimumExclusive,
  longerThanOrEquals: minimumInclusive,
  lt: maximumExclusive,
  lte: maximumInclusive,
  maxLength: maximumInclusive,
  minLength: minimumInclusive,
  shorterThan: maximumExclusive,
  shorterThanOrEquals: maximumInclusive,
};

function describeActual(value: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(value)) {
    return { length: value.length, type: 'array' };
  }

  if (typeof value === 'string') {
    return { length: value.length, type: 'string' };
  }

  if (value === null) {
    return { type: 'null' };
  }

  if (value === undefined) {
    return { type: 'undefined' };
  }

  return { type: typeof value };
}

import type { Rule } from 'eslint';

function findAncestor(context: Rule.RuleContext, type: string) {
  return context.getAncestors().find(isType(type));
}

function isType(type: string) {
  return (node: { type?: string }) => node.type === type;
}

function getLoc(node: {
  loc?: {
    start?: { line: number; column: number };
    end?: { line: number; column: number };
  } | null;
}) {
  const start = node.loc?.start ?? { line: 0, column: 0 };
  const end = node.loc?.end ?? { line: 0, column: 0 };

  return {
    loc: {
      start: {
        line: start.line,
        column: start.column,
      },
      end: {
        line: end.line,
        column: end.column,
      },
    },
  };
}

export { findAncestor, isType, getLoc };

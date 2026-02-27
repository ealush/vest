import path from 'path';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

import { isAllowed } from './common/directives.js';
import { USE_MATCHER, VAR_DEC, FUNC_DEC } from './common/matchers.js';
import { findAncestor, getLoc } from './common/selectors.js';

const RULE_NAME = path.basename(
  new URL('', import.meta.url).pathname,
  path.extname(new URL('', import.meta.url).pathname),
);

type NodeWithId = Node & { id?: { name?: string } } & { parent?: Node };

const hasIdWithName = (
  node?: NodeWithId,
): node is NodeWithId & {
  id: { name: string };
} => Boolean(node?.id && typeof node.id.name === 'string');

export default {
  meta: {
    docs: {
      description:
        'Make sure that functions that use context hooks start with "use"',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    type: 'problem',
  },
  create(context: Rule.RuleContext) {
    return {
      [matcher(FUNC_DEC)]() {
        const parentFunction = findAncestor(context, FUNC_DEC) as
          | NodeWithId
          | undefined;

        if (
          hasIdWithName(parentFunction) &&
          !USE_MATCHER.test(parentFunction.id.name)
        ) {
          if (parentFunction.id) {
            report(context, parentFunction, parentFunction.id);
          }
        }
      },
      [matcher(VAR_DEC)]() {
        const parentFunction = findAncestor(
          context,
          'ArrowFunctionExpression',
        ) as NodeWithId | undefined;

        if (parentFunction) {
          const variableDeclarator = findAncestor(context, VAR_DEC) as
            | NodeWithId
            | undefined;

          if (hasIdWithName(variableDeclarator)) {
            report(context, parentFunction, variableDeclarator.id);
          }
        }
      },
    };
  },
};

function matcher(type: string): string {
  if (type === VAR_DEC) {
    return `${type}${ID_NAME_MATCHER} > ArrowFunctionExpression ${CALL_EXPRESSION_MATCHER}`;
  }
  return `${type}${ID_NAME_MATCHER} ${CALL_EXPRESSION_MATCHER}`;
}

function report(
  context: Rule.RuleContext,
  node: Node,
  id: { name: string; type?: string; loc?: Rule.Node['loc'] },
): void {
  if (isAllowed(context, node, id, RULE_NAME)) {
    return;
  }
  const loc = id && id.loc ? getLoc(id) : {};
  return context.report({
    node,
    ...loc,
    data: {
      identifier: id.name,
    },
    message,
    suggest: [
      {
        desc: suggest,
        fix(fixer) {
          return fixer.replaceText(id, addUseToName(id.name));
        },
      },
    ],
  });
}

function addUseToName(name: string): string {
  return `use${name[0].toUpperCase()}${name.slice(1)}`;
}

const suggest = "Rename function to start with 'use'";

const message =
  "Function {{ identifier }} does not start with 'use' but contains a call to function that starts with 'use'";

const CALL_EXPRESSION_MATCHER = `CallExpression:matches([callee.name=/^use[A-Z]/])`;
const ID_NAME_MATCHER = `:not([id.name=${USE_MATCHER}])`;

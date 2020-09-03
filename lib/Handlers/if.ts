import { Node } from '@voiceflow/api-sdk';

import { HandlerFactory } from '@/lib/Handler';
import { EventType } from '@/lib/Lifecycle';

import { evaluateExpression, regexExpression } from './utils/shuntingYard';

export type IfNode = Node<
  'if',
  {
    expressions: string[];
    nextIds: string[];
    elseId?: string;
  }
>;

const IfHandler: HandlerFactory<IfNode> = () => ({
  canHandle: (node) => {
    return !!(node.expressions && node.expressions.length < 101);
  },
  handle: async (node, context, variables) => {
    // If Node

    for (let i = 0; i < node.expressions.length; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const evaluated = (await evaluateExpression(node.expressions[i], {
          v: variables.getState(),
        })) as any;

        context.trace.debug(`evaluating path ${i + 1}: \`${regexExpression(node.expressions[i])}\` to \`${evaluated?.toString?.()}\``);
        if (evaluated || evaluated === 0) {
          context.trace.debug(`condition true - taking path ${i + 1}`);
          return node.nextIds[i];
        }
      } catch (error) {
        context.trace.debug(`unable to resolve expression \`${regexExpression(node.expressions[i])}\`  \n\`${error}\``);
        // eslint-disable-next-line no-await-in-loop
        await context.callEvent(EventType.handlerDidCatch, { error });
      }
    }

    context.trace.debug('no conditions matched - taking else path');
    return node.elseId || null;
  },
});

export default IfHandler;

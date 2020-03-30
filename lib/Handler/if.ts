import { EventType } from '@/lib/Lifecycle';

import Handler from './index';
import { evaluateExpression, regexExpression } from './utils/shuntingYard';

export type IfBlock = {
  expressions: string[];
  nextIds: string[];
  elseId?: string;
};

const ifHandler: Handler<IfBlock> = {
  canHandle: (block) => {
    return !!(block.expressions && block.expressions.length < 101);
  },
  handle: async (block, context, variables) => {
    // If Block

    for (let i = 0; i < block.expressions.length; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const evaluated = (await evaluateExpression(block.expressions[i], {
          v: variables.getState(),
        })) as any;

        context.trace.debug(`evaluating path ${i + 1}: \`${regexExpression(block.expressions[i])}\` to \`${evaluated?.toString?.()}\``);
        if (evaluated || evaluated === 0) {
          context.trace.debug(`condition true - taking path ${i + 1}`);
          return block.nextIds[i];
        }
      } catch (error) {
        context.trace.debug(`unable to resolve expression \`${regexExpression(block.expressions[i])}\`  \n\`${error}\``);
        // eslint-disable-next-line no-await-in-loop
        await context.callEvent(EventType.handlerDidCatch, { error });
      }
    }

    context.trace.debug('no conditions matched - taking else path');
    return block.elseId || null;
  },
};

export default ifHandler;

import { Event } from '@/lib/Lifecycle';
import { evaluateExpression } from './utils/shuntingYard';
import Handler from './index';

const ifHandler: Handler = {
  canHandle: (block) => {
    return block.expressions && block.expressions.length < 101;
  },
  handle: async (block, context, variables) => {
    // If Block
    let path;

    for (let i = 0; i < block.expressions.length; i++) {
      try {
        const evaluated = await evaluateExpression(block.expressions[i], {
          v: variables.getState(),
        }) as any;

        if (evaluated || evaluated === 0) {
          path = block.nextIds[i];
          break;
        }
      } catch (err) {
        await context.callEvent(Event.handlerDidCatch, err);
      }
    }

    return path || block.elseId;
  },
};

export default ifHandler;

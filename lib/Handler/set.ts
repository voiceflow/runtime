const Promise = require('bluebird');
import { Event } from '@/lib/Lifecycle';
import { evaluateExpression } from './utils/shuntingYard';

import Handler from './index';

const setHandler: Handler = {
  canHandle: (block) => {
    return block.sets && block.sets.length < 21;
  },
  handle: async (block, context, variables) => {
    await Promise.each(block.sets, async (set: { expression: string; variable: string }) => {
      try {
        const evaluated = (await evaluateExpression(set.expression, { v: variables.getState() })) as any;
        // assign only if number or true
        variables.set(set.variable, !isNaN(evaluated) || !!evaluated ? evaluated : undefined);
      } catch (err) {
        await context.callEvent(Event.handlerDidCatch, err);
      }
    });

    return block.nextId;
  },
};

export default setHandler;

import Promise from 'bluebird';

import { Event } from '@/lib/Lifecycle';

import Handler from './index';
import { evaluateExpression } from './utils/shuntingYard';

const setHandler: Handler = {
  canHandle: (block) => {
    return block.sets && block.sets.length < 21;
  },
  handle: async (block, context, variables) => {
    await Promise.each(block.sets, async (set: { expression: string; variable: string }) => {
      try {
        const evaluated = (await evaluateExpression(set.expression, { v: variables.getState() })) as any;
        // assign only if number or true
        variables.set(set.variable, !!evaluated || !Number.isNaN(evaluated) ? evaluated : undefined);
      } catch (err) {
        await context.callEvent(Event.handlerDidCatch, err);
      }
    });

    return block.nextId;
  },
};

export default setHandler;

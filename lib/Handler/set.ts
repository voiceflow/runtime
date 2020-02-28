import Promise from 'bluebird';

import { Event } from '@/lib/Lifecycle';

import Handler from './index';
import { evaluateExpression } from './utils/shuntingYard';

type SetStep = {
  expression: string;
  variable: string;
};

export type SetBlock = {
  sets: Array<SetStep>;
  nextId?: string;
};

const setHandler: Handler<SetBlock> = {
  canHandle: (block) => {
    return block.sets && block.sets.length < 21;
  },
  handle: async (block, context, variables) => {
    await Promise.each<SetStep>(block.sets, async (set) => {
      try {
        const evaluated = (await evaluateExpression(set.expression, { v: variables.getState() })) as any;
        // assign only if number or true
        variables.set(set.variable, !!evaluated || !Number.isNaN(evaluated) ? evaluated : undefined);
      } catch (error) {
        await context.callEvent(Event.handlerDidCatch, { error });
      }
    });

    return block.nextId || null;
  },
};

export default setHandler;

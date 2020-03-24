import Promise from 'bluebird';

import { EventType } from '@/lib/Lifecycle';

import Handler from './index';
import { evaluateExpression, regexExpression } from './utils/shuntingYard';

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
        if (!set.variable) throw new Error('No Variable Defined');

        const evaluated = (await evaluateExpression(set.expression, { v: variables.getState() })) as any;
        const value = !!evaluated || !Number.isNaN(evaluated) ? evaluated : undefined;
        // assign only if truthy or not literally NaN
        context.trace.debug(`setting \`{${set.variable}}\`  \nevaluating \`${regexExpression(set.expression)}\` to \`${value?.toString?.()}\``);
        variables.set(set.variable, value);
      } catch (error) {
        context.trace.debug(`unable to resolve expression \`${regexExpression(set.expression)}\` for \`{${set.variable}}\`  \n\`${error}\``);
        await context.callEvent(EventType.handlerDidCatch, { error });
      }
    });

    return block.nextId || null;
  },
};

export default setHandler;

import Promise from 'bluebird';

import { HandlerFactory } from '@/lib/Handler';
import { EventType } from '@/lib/Lifecycle';

import { evaluateExpression, regexExpression } from './utils/shuntingYard';

type SetStep = {
  expression: string;
  variable: string;
};

export type SetData = {
  sets: Array<SetStep>;
  nextId?: string;
};

const setHandler: HandlerFactory<'set', SetData> = () => ({
  canHandle: (node) => {
    return !!(node.sets && node.sets.length < 21);
  },
  handle: async (node, context, variables) => {
    await Promise.each<SetStep>(node.sets, async (set) => {
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

    return node.nextId || null;
  },
});

export default setHandler;

import { HandlerFactory } from '@/lib/Handler';

export type NextData = {
  nextId?: string;
};

const NextHandler: HandlerFactory<'next', NextData> = () => ({
  canHandle: (node) => {
    return !!node.nextId;
  },
  handle: (node, context) => {
    context.trace.debug('could not handle step - redirecting to the next step');

    return node.nextId ?? null;
  },
});

export default NextHandler;

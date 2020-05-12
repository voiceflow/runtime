import { HandlerFactory } from '@/lib/Handler';

export type NextBlock = {
  nextId?: string;
};

const NextHandler: HandlerFactory<NextBlock> = () => ({
  canHandle: (block) => {
    return !!block.nextId;
  },
  handle: (block, context) => {
    context.trace.debug('could not handle step - redirecting to the next step');

    return block.nextId ?? null;
  },
});

export default NextHandler;

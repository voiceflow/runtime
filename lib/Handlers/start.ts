import { HandlerFactory } from '@/lib/Handler';

export type Start = {
  nextId?: string;
};

const StartHandler: HandlerFactory<Start> = () => ({
  canHandle: (block) => {
    return Object.keys(block).length === 2 && !!block.nextId;
  },
  handle: (block, context) => {
    context.trace.debug('beginning flow');
    return block.nextId ?? null;
  },
});

export default StartHandler;

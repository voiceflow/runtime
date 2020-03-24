import Handler from './index';

export type Start = {
  nextId?: string;
};

const StartHandler: Handler<Start> = {
  canHandle: (block) => {
    return Object.keys(block).length === 2 && !!block.nextId;
  },
  handle: (block, context) => {
    context.trace.debug('beginning flow');
    return block.nextId ?? null;
  },
};

export default StartHandler;

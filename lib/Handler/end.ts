import Handler from './index';

export type EndBlock = {
  end?: string;
};

const EndHandler: Handler<EndBlock> = {
  canHandle: (block) => {
    return !!block.end;
  },
  handle: (_, context): null => {
    context.turn.set('stop', true);
    context.end();

    return null;
  },
};

export default EndHandler;

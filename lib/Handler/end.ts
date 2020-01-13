import Handler from './index';

const EndHandler: Handler = {
  canHandle: (block) => {
    return block.end;
  },
  handle: (_, context) => {
    context.turn.set('stop', true);
    context.end();

    return null;
  },
};

export default EndHandler;

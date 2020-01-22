import Handler from './index';

const EndHandler: Handler = {
  canHandle: (block) => {
    return block.end;
  },
  handle: (_, context) => {
    context.stack.pop();
    context.turn.set('end', true);
    context.end();

    return null;
  },
};

export default EndHandler;

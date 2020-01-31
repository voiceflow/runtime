import Handler from './index';

const StartHandler: Handler<{}> = {
  canHandle: (block) => {
    return Object.keys(block).length === 2 && !!block.nextId;
  },
  handle: (block) => {
    return block.nextId ?? null;
  },
};

export default StartHandler;

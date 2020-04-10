import { S } from '@/lib/Constants';
import { HandlerFactory } from '@/lib/Handler';

export type RandomBlock = {
  random?: number;
  nextIds: string[];
};

const randomHandler: HandlerFactory<RandomBlock> = () => ({
  canHandle: (block) => {
    return !!block.random;
  },
  handle: async (block, context) => {
    let nextId: string;

    if (!block.nextIds.length) {
      context.trace.debug('no random paths connected - exiting');
      return null;
    }

    if (block.nextIds.length === 1) {
      [nextId] = block.nextIds;
    } else if (block.random === 2) {
      // no duplicates random block
      let used: Set<string>;
      const { storage } = context;

      if (!storage.get(S.RANDOMS)) {
        // initialize randoms
        storage.set(S.RANDOMS, {});
      }

      if (storage.get(S.RANDOMS)[block.blockID]?.length) {
        used = new Set(storage.get(S.RANDOMS)[block.blockID]);
      } else {
        used = new Set();
        storage.set(S.RANDOMS, { ...storage.get(S.RANDOMS), [block.blockID]: [] });
      }

      // get all unused choices
      let choices = block.nextIds.filter((choice) => !used.has(choice));
      if (!choices.length) {
        // all choices have been used
        choices = block.nextIds;
        // reset used choices
        storage.set(S.RANDOMS, { ...storage.get(S.RANDOMS), [block.blockID]: [] });
      }

      nextId = choices[Math.floor(Math.random() * choices.length)];
      storage.set(S.RANDOMS, { ...storage.get(S.RANDOMS), [block.blockID]: [...storage.get(S.RANDOMS)[block.blockID], nextId] });
    } else {
      nextId = block.nextIds[Math.floor(Math.random() * block.nextIds.length)];
    }
    context.trace.debug('going down random path');

    return nextId;
  },
});

export default randomHandler;

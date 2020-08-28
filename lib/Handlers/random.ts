import { S } from '@/lib/Constants';
import { HandlerFactory } from '@/lib/Handler';

export type RandomData = {
  random?: number;
  nextIds: string[];
};

const randomHandler: HandlerFactory<'random', RandomData> = () => ({
  canHandle: (node) => {
    return !!node.random;
  },
  handle: async (node, context) => {
    let nextId: string;

    if (!node.nextIds.length) {
      context.trace.debug('no random paths connected - exiting');
      return null;
    }

    if (node.nextIds.length === 1) {
      [nextId] = node.nextIds;
    } else if (node.random === 2) {
      // no duplicates random node
      let used: Set<string>;
      const { storage } = context;

      if (!storage.get(S.RANDOMS)) {
        // initialize randoms
        storage.set(S.RANDOMS, {});
      }

      if (storage.get(S.RANDOMS)[node.id]?.length) {
        used = new Set(storage.get(S.RANDOMS)[node.id]);
      } else {
        used = new Set();
        storage.set(S.RANDOMS, { ...storage.get(S.RANDOMS), [node.id]: [] });
      }

      // get all unused choices
      let choices = node.nextIds.filter((choice) => !used.has(choice));
      if (!choices.length) {
        // all choices have been used
        choices = node.nextIds;
        // reset used choices
        storage.set(S.RANDOMS, { ...storage.get(S.RANDOMS), [node.id]: [] });
      }

      nextId = choices[Math.floor(Math.random() * choices.length)];
      storage.set(S.RANDOMS, { ...storage.get(S.RANDOMS), [node.id]: [...storage.get(S.RANDOMS)[node.id], nextId] });
    } else {
      nextId = node.nextIds[Math.floor(Math.random() * node.nextIds.length)];
    }
    context.trace.debug('going down random path');

    return nextId;
  },
});

export default randomHandler;

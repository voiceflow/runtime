/* eslint-disable no-await-in-loop */

import Context from '@/lib/Context';
import Storage from '@/lib/Context/Store';
import Diagram from '@/lib/Diagram';
import { EventType } from '@/lib/Lifecycle';

const HANDLER_OVERFLOW = 400;

const cycleHandler = async (context: Context, diagram: Diagram, variableState: Storage): Promise<void> => {
  const referenceFrame = context.stack.top();
  const currentFrames = context.stack.getFrames();

  let nextID: string | null = null;
  let i = 0;
  let block = diagram.getBlock(referenceFrame.getBlockID());

  do {
    if (i > HANDLER_OVERFLOW) {
      block = null;
      break;
    } else if (nextID) {
      referenceFrame.setBlockID(nextID);
      block = diagram.getBlock(nextID);
      nextID = null;
    }

    if (block !== null) {
      const _block = block; // resolve TS type

      try {
        const handler = context.getHandlers().find((h) => h.canHandle(_block, context, variableState, diagram));

        if (handler) {
          await context.callEvent(EventType.handlerWillHandle, { block, variables: variableState });

          nextID = await handler.handle(_block, context, variableState, diagram);

          await context.callEvent(EventType.handlerDidHandle, { block, variables: variableState });
        }
      } catch (error) {
        await context.callEvent(EventType.handlerDidCatch, { error });
      }

      // if a block has decided to stop on itself
      if (block.blockID === nextID) {
        context.end();
      }

      // exit conditions for handler loop
      if (!nextID || context.hasEnded() || currentFrames !== context.stack.getFrames()) {
        block = null;
      }
    }

    i++;
  } while (block);
};

export default cycleHandler;

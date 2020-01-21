import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Storage from '@/lib/Context/Store';
import { Event } from '@/lib/Lifecycle';

const HANDLER_OVERFLOW = 400;

const cycleHandler = async (context: Context, diagram: Diagram, variableState: Storage): Promise<void> => {
  const referenceFrame = context.stack.top();

  let nextID: string = null;
  let i: number = 0;
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

    if (block) {
      try {
        // state handlers
        const handlers = [...context.getStateHandlers(), ...context.getHandlers()];
        const handler = handlers.find((handler) => handler.canHandle(block, context, variableState, diagram));

        if (handler) {
          await context.callEvent(Event.handlerWillHandle, context);

          nextID = await handler.handle(block, context, variableState, diagram);

          await context.callEvent(Event.handlerDidHandle, context);
        }
      } catch (error) {
        await context.callEvent(Event.handlerDidCatch, error);
      }

      // if a block has decided to stop on itself
      if (referenceFrame.getBlockID() === nextID) {
        context.end();
      }

      if (!nextID || context.hasEnded()) {
        block = null;
      }
    }

    i++;
  } while (block);
};

export default cycleHandler;

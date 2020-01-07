import Context, { Action } from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Storage from "@/lib/Context/Store";

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
    }

    if (block) {
      let handled: boolean = false;

      // state handlers
      for (const handler of context.getStateHandlers()) {
        if (handler.canHandle(diagram, context, variableState)) {
          handled = true;
          nextID = await handler.handle(diagram, context, variableState);
          break;
        }
      }

      if (!handled) {
        // block handlers
        for (const handler of context.getHandlers()) {
          if (handler.canHandle(block, diagram, context, variableState)) {
            handled = true;
            nextID = await handler.handle(block, diagram, context, variableState);
            break;
          }
        }
      }

      if (!handled || !nextID) {
        block = null;
      }
    }

    i++;
  } while (block && referenceFrame.getBlockID() !== nextID);

  // if a block has decided to stop on itself
  if (block) {
    context.setAction(Action.PROMPT);
  }
};

export default cycleHandler;

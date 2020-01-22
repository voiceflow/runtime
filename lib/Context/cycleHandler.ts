import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Storage from '@/lib/Context/Store';
import { Frame } from '@/lib/Context/Stack';
import { Event } from '@/lib/Lifecycle';

const HANDLER_OVERFLOW = 400;

const loop = async (
  {
    blockID = null,
    context,
    diagram,
    referenceFrame,
    localVariables,
  }: {
    blockID?: string;
    context: Context;
    diagram: Diagram;
    referenceFrame: Frame;
    localVariables: Storage;
  },
  i: number = 0
): Promise<void> => {
  let nextID = blockID;
  let block = diagram.getBlock(nextID);

  if (i > HANDLER_OVERFLOW) {
    return;
  }

  if (nextID) {
    referenceFrame.setBlockID(nextID);
    block = diagram.getBlock(nextID);
    nextID = null;
  }

  if (!block) {
    return;
  }

  // state handlers
  const handlers = [...context.getStateHandlers(), ...context.getHandlers()];
  const handler = handlers.find((handler) => handler.canHandle(block, context, localVariables, diagram));

  if (!handler) {
    return;
  }

  try {
    await context.callEvent(Event.handlerWillHandle, context);

    await handler.beforeHandle?.(block, context, localVariables, diagram);

    nextID = await handler.handle(block, context, localVariables, diagram);

    await context.callEvent(Event.handlerDidHandle, context);
  } catch (error) {
    await context.callEvent(Event.handlerDidCatch, error);
  }

  // if a block has decided to stop on itself
  if (referenceFrame.getBlockID() === nextID) {
    context.end();
  }

  if (!nextID || context.hasEnded()) {
    return;
  }

  await loop({ blockID: nextID, context, diagram, referenceFrame, localVariables }, i + 1);

  await handler.afterHandle?.(block, context, localVariables, diagram);
};

const cycleHandler = async (context: Context, diagram: Diagram, localVariables: Storage): Promise<void> => {
  const referenceFrame = context.stack.top();

  await loop({
    blockID: referenceFrame.getBlockID(),
    context,
    diagram,
    referenceFrame,
    localVariables,
  });
};

export default cycleHandler;

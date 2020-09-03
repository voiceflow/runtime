/* eslint-disable no-await-in-loop */

import Context from '@/lib/Context';
import Storage from '@/lib/Context/Store';
import { EventType } from '@/lib/Lifecycle';
import ProgramModel from '@/lib/Program';

export const HANDLER_OVERFLOW = 400;

const cycleHandler = async (context: Context, program: ProgramModel, variableState: Storage): Promise<void> => {
  const referenceFrame = context.stack.top();
  const currentFrames = context.stack.getFrames();

  let nextID: string | null = null;
  let i = 0;
  let node = program.getNode(referenceFrame.getNodeID());

  do {
    if (i > HANDLER_OVERFLOW) {
      node = null;
      break;
    } else if (nextID) {
      referenceFrame.setNodeID(nextID);
      node = program.getNode(nextID);
      nextID = null;
    }

    if (node !== null) {
      const _node = node; // resolve TS type

      try {
        const handler = context.getHandlers().find((h) => h.canHandle(_node, context, variableState, program));

        if (handler) {
          await context.callEvent(EventType.handlerWillHandle, { node, variables: variableState });

          nextID = await handler.handle(_node, context, variableState, program);

          await context.callEvent(EventType.handlerDidHandle, { node, variables: variableState });
        }
      } catch (error) {
        await context.callEvent(EventType.handlerDidCatch, { error });
      }

      // if a node has decided to stop on itself
      if (node.id === nextID) {
        context.end();
      }

      // exit conditions for handler loop
      if (!nextID || context.hasEnded() || currentFrames !== context.stack.getFrames()) {
        node = null;
      }
    }

    i++;
  } while (node);
};

export default cycleHandler;

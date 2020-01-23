import Context from '@/lib/Context';
import cycleHandler from './cycleHandler';
import { createCombinedVariables, saveCombinedVariables } from './utils/variables';
import { Event } from '@/lib/Lifecycle';
import { S } from '@/lib/Constants';

import { mapOutputsVariables } from './utils/variables';

const STACK_OVERFLOW = 60;

const cycleStack = async <B>(context: Context<B>, calls: number = 0): Promise<void> => {
  if (context.stack.getSize() === 0 || calls > STACK_OVERFLOW) {
    context.end();
    return;
  }

  const currentFrame = context.stack.top();
  const currentFrames = context.stack.getFrames();

  const diagram = await context.fetchDiagram(currentFrame.getDiagramID());
  // update frame with diagram properties
  currentFrame.update<B>(diagram);

  // generate combined variable state (global/local)
  const combinedVariables = createCombinedVariables(context.variables, currentFrame.variables);

  try {
    await context.callEvent(Event.stateWillExecute, diagram);
    await cycleHandler<B>(context, diagram, currentFrame.variables);
    await context.callEvent(Event.stateDidExecute, diagram);
  } catch (error) {
    await context.callEvent(Event.stateDidCatch, error);
  }

  // deconstruct variable state and save to stores
  saveCombinedVariables(combinedVariables, context.variables, currentFrame.variables);

  // Action.END allows you to stay on the same frame and return a response
  if (context.hasEnded()) {
    return;
  }

  if (currentFrames === context.stack.getFrames()) {
    // pop frame
    const poppedFrame = context.stack.pop();

    const topFrame = context.stack.top();

    if (poppedFrame?.storage.get(S.OUTPUT_MAP) && topFrame) {
      mapOutputsVariables(poppedFrame.storage.get(S.OUTPUT_MAP) || [], topFrame.variables, context.variables);
    }
  }

  await cycleStack<B>(context, calls + 1);
};

export default cycleStack;

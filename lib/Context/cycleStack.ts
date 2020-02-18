import { S } from '@/lib/Constants';
import Context from '@/lib/Context';
import { Event } from '@/lib/Lifecycle';

import cycleHandler from './cycleHandler';
import { createCombinedVariables, mapStores, saveCombinedVariables } from './utils/variables';

const STACK_OVERFLOW = 60;

const cycleStack = async (context: Context, depth = 0): Promise<void> => {
  if (context.stack.getSize() === 0 || depth > STACK_OVERFLOW) {
    context.end();
    return;
  }

  const currentFrame = context.stack.top();
  const currentFrames = context.stack.getFrames();

  const diagram = await context.getDiagram(currentFrame.getDiagramID());

  // initialize frame with diagram properties
  currentFrame.initialize(diagram);

  // generate combined variable state (global/local)
  const combinedVariables = createCombinedVariables(context.variables, currentFrame.variables);

  try {
    await context.callEvent(Event.stateWillExecute, diagram, combinedVariables);
    await cycleHandler(context, diagram, combinedVariables);
    await context.callEvent(Event.stateDidExecute, diagram, combinedVariables);
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
    await context.callEvent(Event.frameDidFinish, poppedFrame);

    const topFrame = context.stack.top();

    if (poppedFrame?.storage.get(S.OUTPUT_MAP) && topFrame) {
      mapStores(poppedFrame.storage.get(S.OUTPUT_MAP), combinedVariables, topFrame.variables);
    }
  }

  await cycleStack(context, depth + 1);
};

export default cycleStack;

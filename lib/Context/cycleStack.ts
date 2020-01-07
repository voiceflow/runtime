import Context from '@/lib/Context';
import cycleHandler from './cycleHandler';
import { createVariables, saveVariables } from './variable';
import { Event } from '@/lib/Lifecycle';

const STACK_OVERFLOW = 60;

const cycleStack = async (context: Context, calls: number = 0): Promise<void> => {
  if (context.stack.getSize() === 0 || calls > STACK_OVERFLOW) {
    context.end();
    return;
  }

  const currentFrame = context.stack.top();
  const currentFrames = context.stack.getFrames();

  const diagram = await context.fetchDiagram(currentFrame.diagramID);
  // update frame with diagram properties
  currentFrame.update(diagram);

  // generate combined variable state (local/global)
  const variableState = createVariables(context, currentFrame);

  try {
    await context.callEvent(Event.stateWillExecute, diagram);
    await cycleHandler(context, diagram, variableState);
    await context.callEvent(Event.stateDidExecute, diagram);
  } catch (error) {
    await context.callEvent(Event.stateDidCatch, error);
  }

  // deconstruct variable state and save to stores
  saveVariables(variableState, context, currentFrame);

  // Action.END allows you to stay on the same frame and return a response
  if (context.hasEnded()) {
    return;
  }
  if (currentFrames === context.stack.getFrames()) {
    context.stack.pop();
    // TODO: map variables from popped diagram
  }

  await cycleStack(context, calls + 1);
};

export default cycleStack;

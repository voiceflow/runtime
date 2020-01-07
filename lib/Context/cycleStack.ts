import Context, { Action } from '@/lib/Context';
import cycleHandler from './cycleHandler';
import { createVariables, saveVariables } from './variable';
import { Event } from '@/lib/Lifecycle';

const STACK_OVERFLOW = 60;

const cycleStack = async (context: Context, calls: number = 0): Promise<void> => {
  if (context.stack.getSize() === 0 || calls > STACK_OVERFLOW) {
    context.setAction(Action.END);
    return;
  }

  const currentFrame = context.stack.top();
  const currentSize = context.stack.getSize();

  const diagram = await context.fetchDiagram(currentFrame.diagramID);
  // TODO: update frame with diagram properties

  const variableState = createVariables(context, currentFrame);
  try {
    context.callEvent(Event.stateWillExecute, diagram);

    await cycleHandler(context, diagram, variableState);

    context.callEvent(Event.stateDidExecute, diagram);
  } catch (error) {
    context.callEvent(Event.stateDidCatch, error);
  }

  saveVariables(context, variableState, currentFrame);

  if ([Action.PROMPT, Action.END].includes(context.getAction())) {
    return;
  }
  if (context.stack.getSize() === currentSize && context.stack.top() === currentFrame) {
    context.stack.pop();
    // TODO: map variables from popped diagram
  }

  await cycleStack(context, calls + 1);
};

export default cycleStack;

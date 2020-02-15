import { S } from '@/lib/Constants';
import Context from '@/lib/Context';
import { Event } from '@/lib/Lifecycle';

import Diagram from '../Diagram';
import cycleHandler from './cycleHandler';
import { createCombinedVariables, mapStores, saveCombinedVariables } from './utils/variables';

const STACK_OVERFLOW = 60;
interface CycleContext {
  diagram?: Diagram | null;
  depth: number;
}

const cycleStack = async (context: Context, { diagram, depth }: CycleContext = { depth: 0, diagram: null }): Promise<void> => {
  if (context.stack.getSize() === 0 || depth > STACK_OVERFLOW) {
    context.end();
    return;
  }

  const currentFrame = context.stack.top();
  const currentFrames = context.stack.getFrames();

  if (diagram?.getID() !== currentFrame.getDiagramID()) {
    diagram = await context.fetchDiagram(currentFrame.getDiagramID());
  }

  // update frame with diagram properties
  currentFrame.update(diagram);

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
    // TODO: ADD A NATURAL POP EVENT (pop because previous flow ended)
    const poppedFrame = context.stack.pop();

    const topFrame = context.stack.top();

    if (poppedFrame?.storage.get(S.OUTPUT_MAP) && topFrame) {
      mapStores(poppedFrame.storage.get(S.OUTPUT_MAP), combinedVariables, topFrame.variables);
    }
  }

  await cycleStack(context, { depth: depth + 1, diagram });
};

export default cycleStack;

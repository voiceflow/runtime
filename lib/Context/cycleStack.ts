import { S } from '@/lib/Constants';
import Context from '@/lib/Context';
import { EventType } from '@/lib/Lifecycle';

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

  const program = await context.getProgram(currentFrame.getProgramID());

  // initialize frame with program properties
  currentFrame.initialize(program);

  // generate combined variable state (global/local)
  const combinedVariables = createCombinedVariables(context.variables, currentFrame.variables);

  try {
    await context.callEvent(EventType.stateWillExecute, { program, variables: combinedVariables });
    await cycleHandler(context, program, combinedVariables);
    await context.callEvent(EventType.stateDidExecute, { program, variables: combinedVariables });
  } catch (error) {
    await context.callEvent(EventType.stateDidCatch, { error });
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
    await context.callEvent(EventType.frameDidFinish, { frame: poppedFrame });

    const topFrame = context.stack.top();

    if (poppedFrame?.storage.get(S.OUTPUT_MAP) && topFrame) {
      mapStores(poppedFrame.storage.get<[string, string][]>(S.OUTPUT_MAP)!, combinedVariables, topFrame.variables);
    }
  }

  await cycleStack(context, depth + 1);
};

export default cycleStack;

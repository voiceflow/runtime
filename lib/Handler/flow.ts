import Frame from '@/lib/Context/Stack/Frame';
import Handler from './index';

import { createCombinedVariables } from '../Context/utils/variables';
import { Block } from '@/lib/Diagram';

type FlowBlock = Block & {
  diagram_id: string;
  variable_map?: {
    inputs: [string, string][];
    outputs: [string, string][];
  };
};

const FlowHandler: Handler = {
  canHandle: (block: FlowBlock) => {
    return !!block.diagram_id;
  },

  beforeHandle: (block: FlowBlock, context, variables) => {
    const topFrame = context.stack.top();

    const combinedVariables = createCombinedVariables(context.variables, variables);

    const frame = new Frame({ diagramID: block.diagram_id, variables: combinedVariables.getState() });

    // map block variable map input to frame
    frame.variables.produce((draft) => {
      block.variable_map.inputs?.forEach(([currentVal, newVal]) => {
        draft[newVal] = context.variables.get(currentVal);
      });
    });

    topFrame.storage.set('frame', frame);
  },

  handle: (block: FlowBlock, context) => {
    const topFrame = context.stack.top();

    topFrame.setBlockID(block.nextId ?? null);

    context.stack.push(topFrame.storage.get('frame'));

    return null;
  },

  afterHandle: (block: FlowBlock, context) => {
    const topFrame = context.stack.top();
    const frame = topFrame.storage.get('frame');

    block.variable_map.outputs.forEach(([newVal, currentVal]) => {
      context.variables.set(newVal, frame.variables.get(currentVal));
    });
  },
};

export default FlowHandler;

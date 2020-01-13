import Frame from '@/lib/Context/Stack/Frame';
import Handler from './index';

const FlowHandler: Handler = {
  canHandle: (block) => {
    return block.diagram_id;
  },
  handle: (block, context, variables) => {
    const newFrame = new Frame({ diagramID: block.diagram_id });

    // map block variable map input to frame
    newFrame.variables.produce((draft) => {
      block.variable_map.inputs?.forEach(([currentVal, newVal]) => {
        draft[newVal] = variables.get(currentVal);
      });
    });
    // attach block variable map outputs to frame
    newFrame.storage.set('outputMap', block.variable_map.outputs);

    const topFrame = context.stack.top();
    topFrame.setBlockID(block.nextId ?? false);

    context.stack.push(newFrame);
    return null;
  },
};

export default FlowHandler;

import Frame from '@/lib/Context/Stack/Frame';
import Handler from './index';

const FlowHandler: Handler = {
  canHandle: (block) => {
    return block.diagram_id;
  },
  handle: (block, context, variables) => {
    const frame = new Frame({ diagramID: block.diagram_id });

    block.variable_map.inputs?.forEach((values) => {
      const currentVal = values[0];
      const newVal = values[1];
      frame.variables.produce((draft) => {
        draft[newVal] = variables.getState()[currentVal];
      });
    });
    frame.storage.set('outputMap', block.variable_map.outputs);

    const topFrame = context.stack.top();
    topFrame.setBlockID(block.nextId ?? false);
    // topFrame.storage.set('outputMap', block.variable_map.outputs);

    context.stack.push(frame);
    return null;
  },
};

export default FlowHandler;

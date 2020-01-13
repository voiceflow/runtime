import Frame from '@/lib/Context/Stack/Frame';
import Handler from './index';

const FlowHandler: Handler = {
  canHandle: (block) => {
    return block.diagram_id;
  },
  handle: (block, context) => {
    context.stack.push(new Frame({ diagramID: block.diagram_id }));
    return null;
  },
};

export default FlowHandler;

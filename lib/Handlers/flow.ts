import { S } from '@/lib/Constants';
import Frame from '@/lib/Context/Stack/Frame';
import { HandlerFactory } from '@/lib/Handler';

import { mapStores } from '../Context/utils/variables';

export type FlowBlock = {
  diagram_id?: string;
  variable_map?: {
    inputs?: [string, string][];
    outputs?: [string, string][];
  };
  nextId?: string;
};

const FlowHandler: HandlerFactory<FlowBlock> = () => ({
  canHandle: (block) => {
    return !!block.diagram_id;
  },
  handle: (block, context, variables) => {
    if (!block.diagram_id) {
      return block.nextId || null;
    }

    const newFrame = new Frame({ diagramID: block.diagram_id });

    // map block variable map input to frame
    mapStores(block.variable_map?.inputs || [], variables, newFrame.variables);

    // attach block variable map outputs to frame
    newFrame.storage.set(
      S.OUTPUT_MAP,
      // adapt outputs format to [[currentVal, newVal]] - like inputs
      block.variable_map?.outputs?.map((val) => [val[1], val[0]])
    );

    const topFrame = context.stack.top();
    topFrame.setBlockID(block.nextId ?? null);

    context.stack.push(newFrame);
    context.trace.debug(`entering flow \`${newFrame.getDiagramID()}\``);
    return null;
  },
});

export default FlowHandler;

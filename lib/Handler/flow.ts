import { S } from '@/lib/Constants';
import Frame from '@/lib/Context/Stack/Frame';

import { mapStores } from '../Context/utils/variables';
import Handler from './index';

export type FlowBlock = {
  diagram_id: string;
  variable_map?: {
    inputs?: [string, string][];
    outputs?: [string, string][];
  };
  nextId?: string;
};

const FlowHandler: Handler<FlowBlock> = {
  canHandle: (block) => {
    return !!block.diagram_id;
  },
  handle: (block, context, variables): null => {
    const newFrame = new Frame({ diagramID: block.diagram_id });

    // map block variable map input to frame
    mapStores(block?.variable_map?.inputs || [], variables, newFrame.variables);

    // attach block variable map outputs to frame
    newFrame.storage.set(S.OUTPUT_MAP, block?.variable_map?.outputs);

    const topFrame = context.stack.top();
    topFrame.setBlockID(block.nextId ?? null);

    context.stack.push(newFrame);
    return null;
  },
};

export default FlowHandler;

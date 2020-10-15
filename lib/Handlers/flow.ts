import { Node } from '@voiceflow/general-types/build/nodes/flow';

import { S } from '@/lib/Constants';
import Frame from '@/lib/Context/Stack/Frame';
import { HandlerFactory } from '@/lib/Handler';

import { mapStores } from '../Context/utils/variables';

const FlowHandler: HandlerFactory<Node> = () => ({
  canHandle: (node) => !!node.diagram_id,
  handle: (node, context, variables) => {
    if (!node.diagram_id) {
      return node.nextId || null;
    }

    const newFrame = new Frame({ programID: node.diagram_id });

    // map node variable map input to frame
    mapStores(node.variable_map?.inputs || [], variables, newFrame.variables);

    // TODO: remove storage
    // attach node variable map outputs to frame
    newFrame.storage.set(
      S.OUTPUT_MAP,
      // adapt outputs format to [[currentVal, newVal]] - like inputs
      node.variable_map?.outputs?.map((val) => [val[1], val[0]])
    );

    const topFrame = context.stack.top();
    topFrame.setNodeID(node.nextId ?? null);

    context.stack.push(newFrame);

    context.trace.debug(`entering flow \`${newFrame.getProgramID()}\``);

    return null;
  },
});

export default FlowHandler;

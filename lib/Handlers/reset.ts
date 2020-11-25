import { Node } from '@voiceflow/api-sdk';

import { HandlerFactory } from '@/lib/Handler';

export type ResetNode = Node<any, { reset?: boolean }>;

/**
 * reset the entire stack to the first flow and it's first node
 */
const ResetHandler: HandlerFactory<ResetNode> = () => ({
  canHandle: (node) => !!node.reset,
  handle: (_, context) => {
    context.stack.popTo(1);
    context.stack.top().setNodeID(undefined);

    return null;
  },
});

export default ResetHandler;

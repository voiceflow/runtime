import { Node } from '@voiceflow/api-sdk';

import { HandlerFactory } from '@/lib/Handler';

export type NextNode = Node<
  'next',
  {
    nextId?: string;
  }
>;

const NextHandler: HandlerFactory<NextNode> = () => ({
  canHandle: (node) => {
    return !!node.nextId;
  },
  handle: (node, context) => {
    context.trace.debug('could not handle step - redirecting to the next step');

    return node.nextId ?? null;
  },
});

export default NextHandler;

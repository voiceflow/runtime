import { Node } from '@voiceflow/api-sdk';

import { HandlerFactory } from '@/lib/Handler';

export type EndNode = Node<
  'exit',
  {
    end?: string;
  }
>;

const EndHandler: HandlerFactory<EndNode> = () => ({
  canHandle: (node) => {
    return !!node.end;
  },
  handle: (_, context): null => {
    context.stack.pop();
    context.turn.set('end', true);
    context.end();

    context.trace.debug('exiting session - saving location/resolving stack');

    return null;
  },
});

export default EndHandler;

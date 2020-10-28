import { TraceType } from '@voiceflow/general-types';
import { Node, TraceFrame } from '@voiceflow/general-types/build/nodes/exit';

import { HandlerFactory } from '@/lib/Handler';

const EndHandler: HandlerFactory<Node> = () => ({
  canHandle: (node) => !!node.end,
  handle: (_, context): null => {
    context.stack.pop();

    context.turn.set('end', true);
    context.trace.addTrace<TraceFrame>({ type: TraceType.END });
    context.trace.debug('exiting session - saving location/resolving stack');

    context.end();

    return null;
  },
});

export default EndHandler;

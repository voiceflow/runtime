import { Node, TraceFrame } from '@voiceflow/general-types/build/nodes/trace';

import { RequestType } from '@/../general-types/build';
import { HandlerFactory } from '@/lib/Handler';

const TraceHandler: HandlerFactory<Node> = () => ({
  canHandle: (node) => !!node._v,
  handle: (node, runtime) => {
    const defaultPath = node.paths[node.defaultPath!]?.nextID || null;

    if (!node.stop) {
      runtime.trace.addTrace<TraceFrame>({
        type: node.type,
        payload: { data: node.data, paths: node.paths },
      });

      return defaultPath;
    }

    const request = runtime.getRequest();

    if (request?.type !== RequestType.TRACE) {
      runtime.trace.addTrace<TraceFrame>({
        type: node.type,
        payload: { data: node.data, paths: node.paths },
      });

      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }

    return node.paths[request.payload.pathIndex]?.nextID ?? defaultPath;
  },
});

export default TraceHandler;

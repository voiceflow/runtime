import { GeneralRequest, RequestType, TraceRequest } from '@voiceflow/general-types/build';
import { Node, TraceFrame } from '@voiceflow/general-types/build/nodes/trace';

import { HandlerFactory } from '@/lib/Handler';

const isTraceRequest = (request: GeneralRequest | null): request is TraceRequest => {
  return request?.type === RequestType.TRACE;
};

const TraceHandler: HandlerFactory<Node> = () => ({
  canHandle: (node) => !!node._v,
  handle: (node, runtime) => {
    const defaultPath = node.paths[node.defaultPath!]?.nextID || null;

    const request: GeneralRequest | null = runtime.getRequest();

    if (isTraceRequest(request)) {
      return node.paths[request.payload.pathIndex!]?.nextID ?? defaultPath;
    }

    runtime.trace.addTrace<TraceFrame>({
      type: node.type,
      payload: { data: node.data, paths: node.paths },
    });

    // if !stop continue to defaultPath otherwise
    // quit cycleStack without ending session by stopping on itself
    return !node.stop ? defaultPath : node.id;
  },
});

export default TraceHandler;

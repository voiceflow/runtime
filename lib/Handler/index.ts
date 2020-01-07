import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';

export interface Handler {
  canHandle: (block, diagram: Diagram, context: Context, variables: object) => boolean;
  handle: (block, diagram: Diagram, context: Context, variables: object) => string;
}

export interface StateHandler {
  canHandle: (diagram: Diagram, context: Context, variables: object) => boolean;
  handle: (diagram: Diagram, context: Context, variables: object) => string;
}

export default Handler;

import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Store from '@/lib/Context/Store';

export interface Handler {
  canHandle: (block: object, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block: object, context: Context, variables: Store, diagram: Diagram) => string | Promise<string>;
}

export default Handler;

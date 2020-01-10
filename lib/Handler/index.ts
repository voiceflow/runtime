import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Store from '@/lib/Context/Store';

type Block = Record<string, any>;

export interface Handler {
  canHandle: (block: Block, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block: Block, context: Context, variables: Store, diagram: Diagram) => string | Promise<string>;
}

export default Handler;

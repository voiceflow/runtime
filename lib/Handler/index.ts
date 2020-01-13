import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Store from '@/lib/Context/Store';

// handlers
import CodeHandler from './code';
import EndHandler from './end';
import FlowHandler from './flow';
import StartHandler from './start';

type Block = Record<string, any>;

export interface Handler {
  canHandle: (block: Block, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block: Block, context: Context, variables: Store, diagram: Diagram) => string | Promise<string>;
}

export const DefaultHandlers = [CodeHandler, EndHandler, FlowHandler, StartHandler];

export default Handler;

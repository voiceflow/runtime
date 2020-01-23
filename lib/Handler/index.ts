import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Diagram from '@/lib/Diagram';

// handlers
import CodeHandler from './code';
import EndHandler from './end';
import FlowHandler from './flow';
import RandomHandler from './random';
import SetHandler from './set';
import StartHandler from './start';

type Block = Record<string, any>;

export default interface Handler {
  canHandle: (block: Block, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block: Block, context: Context, variables: Store, diagram: Diagram) => string | Promise<string>;
}

export const DefaultHandlers = [CodeHandler, EndHandler, FlowHandler, StartHandler, RandomHandler, SetHandler];

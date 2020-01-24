import Context from '@/lib/Context';
import Diagram, { Block } from '@/lib/Diagram';
import Store from '@/lib/Context/Store';

// handlers
import CodeHandler, { CodeBlock } from './code';
import EndHandler, { EndBlock } from './end';
import FlowHandler, { FlowBlock } from './flow';
import StartHandler from './start';
import RandomHandler from './random';
import IfHandler from './if';
import SetHandler from './set';

export interface Handler<B> {
  canHandle: (block: Block<B>, context: Context<B>, variables: Store, diagram: Diagram<B>) => boolean;
  handle: (block: Block<B>, context: Context<B>, variables: Store, diagram: Diagram<B>) => null | string | Promise<string | null>;
}

export type DefaultBlock = FlowBlock | CodeBlock | EndBlock;

export const DefaultHandlers = [CodeHandler, EndHandler, FlowHandler, StartHandler, RandomHandler, SetHandler, IfHandler];

export default Handler;

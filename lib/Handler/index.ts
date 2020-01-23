import Context from '@/lib/Context';
import Diagram, { Block } from '@/lib/Diagram';
import Store from '@/lib/Context/Store';

// handlers
import EndHandler, { EndBlock } from './end';
import CodeHandler, { CodeBlock } from './code';
import FlowHandler, { FlowBlock } from './flow';
import StartHandler from './start';

export interface Handler<B> {
  canHandle: (block: Block<B>, context: Context<B>, variables: Store, diagram: Diagram<B>) => boolean;
  handle: (block: Block<B>, context: Context<B>, variables: Store, diagram: Diagram<B>) => null | string | Promise<string | null>;
}

export type DefaultBlock = FlowBlock | CodeBlock | EndBlock;

export const DefaultHandlers = [CodeHandler, EndHandler, FlowHandler, StartHandler];

export default Handler;

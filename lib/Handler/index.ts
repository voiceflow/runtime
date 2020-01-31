import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Diagram, { Block } from '@/lib/Diagram';

// handlers
import CodeHandler, { CodeBlock } from './code';
import EndHandler, { EndBlock } from './end';
import FlowHandler, { FlowBlock } from './flow';
import IfHandler from './if';
import IntegrationsHandler from './integrations';
import RandomHandler from './random';
import SetHandler from './set';
import StartHandler from './start';

export default interface Handler<B> {
  canHandle: (block: Block<B>, context: Context<B>, variables: Store, diagram: Diagram<B>) => boolean;
  handle: (block: Block<B>, context: Context<B>, variables: Store, diagram: Diagram<B>) => null | string | Promise<string | null>;
}

export type DefaultBlock = CodeBlock | EndBlock | FlowBlock;

export const DefaultHandlers = [
  CodeHandler,
  EndHandler,
  FlowHandler,
  StartHandler,
  RandomHandler,
  SetHandler,
  IfHandler,
  IntegrationsHandler,
] as Handler<DefaultBlock>[];

import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Diagram from '@/lib/Diagram';

// handlers
import CodeHandler from './code';
import EndHandler from './end';
import FlowHandler from './flow';
import IfHandler from './if';
import IntegrationsHandler from './integrations';
import RandomHandler from './random';
import SetHandler from './set';
import StartHandler from './start';

export type Block<B = {}> = B & {
  blockID: string;
  [key: string]: any;
};

export default interface Handler<B> {
  canHandle: (block: Block<B>, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block: Block<B>, context: Context, variables: Store, diagram: Diagram) => null | string | Promise<string | null>;
}

export const DefaultHandlers = [
  CodeHandler,
  EndHandler,
  FlowHandler,
  StartHandler,
  RandomHandler,
  SetHandler,
  IfHandler,
  IntegrationsHandler,
] as Handler<Block>[];

import { Node } from '@voiceflow/api-sdk';

import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Program from '@/lib/Program';

export default interface Handler<N extends Node = Node<any, any>> {
  canHandle: (node: N, context: Context, variables: Store, program: Program) => boolean;
  handle: (node: N, context: Context, variables: Store, program: Program) => null | string | Promise<string | null>;
}

export type HandlerFactory<N extends Node, O = void> = (options: O) => Handler<N>;

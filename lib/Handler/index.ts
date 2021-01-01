import { Node } from '@voiceflow/api-sdk';

import Program from '@/lib/Program';
import Runtime from '@/lib/Runtime';
import Store from '@/lib/Runtime/Store';

export default interface Handler<N extends Node = Node<any, any>, R extends any = any> {
  canHandle: (node: N, runtime: Runtime<R>, variables: Store, program: Program) => boolean;
  handle: (node: N, runtime: Runtime<R>, variables: Store, program: Program) => null | string | Promise<string | null>;
}

export type HandlerFactory<N extends Node, O = void> = (options: O) => Handler<N>;

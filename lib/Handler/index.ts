import { Node } from '@voiceflow/api-sdk';

import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Program from '@/lib/Program';

export default interface Handler<T extends string = any, B extends {} = any> {
  canHandle: (node: Node<T, B>, context: Context, variables: Store, program: Program) => boolean;
  handle: (node: Node<T, B>, context: Context, variables: Store, program: Program) => null | string | Promise<string | null>;
}

export type HandlerFactory<T extends string, B, O = void> = (options: O) => Handler<T, B>;

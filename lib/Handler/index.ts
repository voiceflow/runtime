import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Diagram from '@/lib/Diagram';

export type Block<B extends {} = {}> = B & {
  blockID: string;
};

export default interface Handler<B extends {} = any> {
  canHandle: (block: Block<B>, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block: Block<B>, context: Context, variables: Store, diagram: Diagram) => null | string | Promise<string | null>;
}

export type HandlerFactory<B, O = void> = (options: O) => Handler<B>;

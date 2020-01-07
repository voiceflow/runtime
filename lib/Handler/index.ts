import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Store from "@/lib/Context/Store";

export interface Handler {
  canHandle: (block, diagram: Diagram, context: Context, variables: Store) => boolean;
  handle: (block, diagram: Diagram, context: Context, variables: Store) => string;
}

export default Handler;

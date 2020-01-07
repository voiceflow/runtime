import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import Store from "@/lib/Context/Store";

export interface Handler {
  canHandle: (block, context: Context, variables: Store, diagram: Diagram) => boolean;
  handle: (block, context: Context, variables: Store, diagram: Diagram) => string;
}

export default Handler;

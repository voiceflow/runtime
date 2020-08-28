import { HandlerFactory } from '@/lib/Handler';

export type Start = {
  type?: string;
  nextId?: string;
};

const StartHandler: HandlerFactory<'start', Start> = () => ({
  canHandle: (node) => {
    return (Object.keys(node).length === 2 || node.type === 'start') && !!node.nextId;
  },
  handle: (node, context) => {
    context.trace.debug('beginning flow');
    return node.nextId ?? null;
  },
});

export default StartHandler;

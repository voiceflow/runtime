import Context from '@/lib/Context';

interface Handler {
  canHandle: (context: Context) => boolean,
  handle: (context: Context) => any,
};

export default Handler;

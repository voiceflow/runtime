import Context from '@/lib/Context';

interface Handler {
  handle: (context: Context) => any;
  canHandle: (context: Context) => boolean;
}

export default Handler;

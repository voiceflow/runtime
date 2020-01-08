import Context from '@/lib/Context';

export const extractRequest = (request: string, context: Context) => {
  // iterate from top forwards
  const stack = context.stack.getFrames();

  for (let i = stack.length - 1; i >= 0; i--) {
    const frame = stack[i];

    if (frame.getRequests().hasOwnProperty(request)) {
      context.stack.lift();
    }
  }
};

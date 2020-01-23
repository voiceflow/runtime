import Stack from '../Context/Stack';

// eslint-disable-next-line import/prefer-default-export
export const extractFrameCommand = (stack: Stack, matcher: (object, any?) => boolean, match?: any): { index: number; command: any } => {
  const frames = stack.getFrames();
  // iterate from top forwards
  for (let index = frames.length - 1; index >= 0; index--) {
    const frame = frames[index];

    const matched = frame.getCommands().find((command) => matcher(command, match));
    if (matched) {
      return { index, command: matched };
    }
  }

  return { index: null, command: null };
};

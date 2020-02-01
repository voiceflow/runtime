import Stack from '../Context/Stack';
import { Command } from '../Diagram';

type Matcher = (command: Command, match?: any) => boolean;

// eslint-disable-next-line import/prefer-default-export
export const extractFrameCommand = (
  stack: Stack,
  matcher: Matcher,
  match?: any
): { index: null; command: null } | { index: number; command: Command } => {
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

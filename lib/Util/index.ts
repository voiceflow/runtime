import { Command } from '@voiceflow/api-sdk';

import Stack from '../Context/Stack';

type Matcher = (command: Command, match?: any) => boolean;

// eslint-disable-next-line import/prefer-default-export
export const extractFrameCommand = (stack: Stack, matcher: Matcher, match?: any): { index: number; command: Command } | null => {
  const frames = stack.getFrames();
  // iterate from top forwards
  for (let index = frames.length - 1; index >= 0; index--) {
    const frame = frames[index];

    const matched = frame.getCommands().find((command) => matcher(command, match));

    if (matched) {
      return { index, command: matched };
    }
  }

  return null;
};

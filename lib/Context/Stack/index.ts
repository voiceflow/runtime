import Frame, { FrameState } from './Frame';
import produce from 'immer';

class Stack {
  private frames: Frame[] = [];

  initialize(stack: FrameState[]) {
    this.frames = [...stack.map((frameState) => new Frame(frameState))];
  }

  getState(): FrameState[] {
    return this.frames.map((frame) => frame.getState());
  }

  constructor(stack?: FrameState[]) {
    this.initialize(stack);
  }

  top(): Frame {
    return this.frames[this.frames.length - 1];
  }

  pop(): Frame {
    let frame;
    this.frames = produce(this.frames,(draft: Frame[]) => {
      frame = draft.pop();
    });

    return frame;
  }

  push(frame: Frame): void {
    this.frames = [...this.frames, frame];
  }
}

export { Frame, FrameState };
export default Stack;
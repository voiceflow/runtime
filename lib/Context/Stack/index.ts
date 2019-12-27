import produce from 'immer';

import Frame, { State as FrameState } from './Frame';

class Stack {
  static getFrames(stack: FrameState[]): Frame[] {
    return [...stack.map((frameState) => new Frame(frameState))];
  }

  private frames: Frame[] = [];

  constructor(stack: FrameState[]) {
    this.frames = Stack.getFrames(stack);
  }

  getState(): FrameState[] {
    return this.frames.map((frame) => frame.getState());
  }

  getDepth(): number {
    return this.frames.length;
  }

  top(): Frame {
    return this.frames[this.frames.length - 1];
  }

  pop(): Frame | void {
    let frame: Frame | void;

    this.frames = produce(this.frames, (draft: Frame[]) => {
      frame = draft.pop();
    });

    return frame;
  }

  lift(depth: number = 1): void {
    this.frames = this.frames.slice(0, this.frames.length - depth);
  }

  push(frame: Frame): void {
    this.frames = [...this.frames, frame];
  }

  update(frames: FrameState[]): void {
    this.frames = Stack.getFrames(frames);
  }
}

export { Frame, FrameState };

export default Stack;

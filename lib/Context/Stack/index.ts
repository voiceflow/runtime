import Frame, { FrameState } from './Frame';
import produce from 'immer';

class Stack<T, V, S> {
  private frames: Frame<T, V, S>[] = [];

  initialize(stack: FrameState<T, V, S>[]) {
    this.frames = [...stack.map((frameState) => new Frame(frameState))];
  }

  getState(): FrameState<T, V, S>[] {
    return this.frames.map((frame) => frame.getState());
  }

  constructor(stack: FrameState<T, V, S>[]) {
    this.initialize(stack);
  }

  getDepth(): number {
    return this.frames.length;
  }

  top(): Frame<T, V, S> {
    return this.frames[this.frames.length - 1];
  }

  pop(): Frame<T, V, S> | void {
    let frame;

    this.frames = produce(this.frames, (draft: Frame<T, V, S>[]) => {
      frame = draft.pop();
    });

    return frame;
  }

  lift(depth: number = 1): void {
    this.frames = this.frames.slice(0, this.frames.length - depth);
  }

  push(frame: Frame<T, V, S>): void {
    this.frames = [...this.frames, frame];
  }
}
export { Frame, FrameState };
export default Stack;
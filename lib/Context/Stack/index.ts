import produce from 'immer';

import Frame, { State as FrameState } from './Frame';

type Handlers = {
  didPop?: Function;
  willPop?: Function;
  didPush?: Function;
  willPush?: Function;
};

class Stack {
  static getFrames(stack: FrameState[]): Frame[] {
    return [...stack.map((frameState) => new Frame(frameState))];
  }

  private frames: Frame[] = [];

  constructor(stack: FrameState[] = [], private handlers: Handlers) {
    this.frames = Stack.getFrames(stack);
  };

  public getState(): FrameState[] {
    return this.frames.map((frame) => frame.getState());
  }

  public getSize(): number {
    return this.frames.length;
  }

  public top(): Frame {
    return this.frames[this.frames.length - 1];
  }

  public pop(): Frame | void {
    let frame: Frame | void;

    this.handlers?.willPop(this.frames);

    this.frames = produce(this.frames, (draft: Frame[]) => {
      frame = draft.pop();
    });

    this.handlers?.didPop(this.frames, frame);

    return frame;
  }

  public lift(depth: number = 1): void {
    this.frames = this.frames.slice(0, this.frames.length - depth);
  }

  public push(frame: Frame): void {
    this.handlers?.willPush(this.frames, frame);

    this.frames = [...this.frames, frame];

    this.handlers?.didPush(this.frames);
  }

  public update(frames: FrameState[]): void {
    this.frames = Stack.getFrames(frames);
  }

  public getFrames(): Frame[] {
    return this.frames;
  }

  public isEmpty(): boolean {
    return this.getSize() === 0;
  }

  public flush(): void {
    this.frames = [];
  }
}

export { Frame, FrameState };

export default Stack;

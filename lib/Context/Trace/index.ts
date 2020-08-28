import { EventType } from '@/lib/Lifecycle';

import Context from '..';

export interface TraceFrame {
  type: string;
  payload?: any;
}

export enum TraceType {
  BLOCK = 'node',
  SPEAK = 'speak',
  FLOW = 'flow',
  STREAM = 'stream',
  DEBUG = 'debug',
  END = 'end',
  CHOICE = 'choice',
}

export enum StreamAction {
  LOOP = 'LOOP',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
}

export interface Choice {
  name: string;
}

export default class Trace {
  private trace: TraceFrame[] = [];

  constructor(private context: Context) {}

  addTrace(frame: TraceFrame) {
    let stop = false;

    this.context.callEvent(EventType.traceWillAdd, {
      frame,
      stop: () => {
        stop = true;
      },
    });

    if (stop) return;

    this.trace = [...this.trace, frame];
  }

  get() {
    return this.trace;
  }

  node = (nodeID: string) =>
    this.addTrace({
      type: TraceType.BLOCK,
      payload: { nodeID },
    });

  speak = (message: string) =>
    this.addTrace({
      type: TraceType.SPEAK,
      payload: { message },
    });

  end = () =>
    this.addTrace({
      type: TraceType.END,
    });

  stream = (src: string, token: string, action: StreamAction) =>
    this.addTrace({
      type: TraceType.STREAM,
      payload: { src, action, token },
    });

  flow(programID: string) {
    this.addTrace({
      type: TraceType.FLOW,
      payload: { programID },
    });
  }

  choice(choices: Choice[]) {
    this.addTrace({
      type: TraceType.CHOICE,
      payload: { choices },
    });
  }

  debug = (message: string) =>
    this.addTrace({
      type: TraceType.DEBUG,
      payload: { message },
    });
}

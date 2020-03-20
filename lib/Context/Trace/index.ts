import { EventType } from '@/lib/Lifecycle';

import Context from '..';

export interface TraceFrame {
  type: string;
  payload?: any;
}

export enum TraceType {
  BLOCK = 'block',
  SPEAK = 'speak',
  FLOW = 'flow',
  STREAM = 'stream',
  DEBUG = 'debug',
  END = 'end',
}

export enum StreamAction {
  LOOP = 'LOOP',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
}

export default class Trace {
  private trace: TraceFrame[] = [];

  constructor(private context: Context) {}

  async addTrace(frame: TraceFrame) {
    let stop = false;

    await this.context.callEvent(EventType.traceWillAdd, {
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

  block = (blockID: string) =>
    this.addTrace({
      type: TraceType.BLOCK,
      payload: { blockID },
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

  stream = (src: string, action: StreamAction) =>
    this.addTrace({
      type: TraceType.STREAM,
      payload: { src, action },
    });

  flow(diagramID: string) {
    this.addTrace({
      type: TraceType.FLOW,
      payload: { diagramID },
    });
  }

  debug = (message: string) =>
    this.addTrace({
      type: TraceType.DEBUG,
      payload: { message },
    });
}

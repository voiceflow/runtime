import { DebugTraceFrame, TraceFrame, TraceType } from '@voiceflow/general-types';

import { EventType } from '@/lib/Lifecycle';

import Context from '..';

export default class Trace {
  private traces: TraceFrame[] = [];

  constructor(private context: Context) {}

  addTrace<TF extends TraceFrame>(frame: TF | DebugTraceFrame) {
    let stop = false;

    this.context.callEvent(EventType.traceWillAdd, {
      frame,
      stop: () => {
        stop = true;
      },
    });

    if (stop) return;

    this.traces = [...this.traces, frame];
  }

  getState<TF extends TraceFrame>(): TF[] {
    return this.traces as TF[];
  }

  debug(message: string) {
    this.addTrace({ type: TraceType.DEBUG, payload: { message } });
  }
}

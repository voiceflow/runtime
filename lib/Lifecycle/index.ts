import Context from '@/lib/Context';

export enum Event {
  contextWillMount,
  contextWillUnmount,
  contextDidCatch,
  updateWillExecute,
  updateDidExecute,
  updateDidCatch,
  diagramWillFetch,
  diagramDidFetch,
  stackWillPush,
  stackDidPush,
  stateWillExecute,
  stateDidExecute,
  stateDidCatch,
  handlerWillHandle,
  handlerDidHandler,
  handlerDidCatch,
  stackWillPop,
  stackDidPop,
  storageWillUpdate,
  storageDidUpdate,
  turnWillUpdate,
  turnDidUpdate,
  variablesWillUpdate,
  variablesDidUpdate,
}

export type Callback = (context: Context, ...args: any[]) => any | Promise<any>;

export type Events = { [key in keyof typeof Event]?: Callback };

class Lifecycle {
  private events: Events = {};

  public setEvent(event: Event, callback: Callback) {
    this.events[event] = callback;
  }

  public getEvent(event: Event): Callback {
    return this.events[event] ?? (() => {});
  }

  public async callEvent(event: Event, context: Context, ...args: any[]): Promise<any> {
    return this.getEvent(event)(context, ...args);
  }
}

export abstract class AbstractLifecycle {
  constructor(protected events: Lifecycle = new Lifecycle()) {}

  public setEvent(event: Event, callback: Callback) {
    this.events.setEvent(event, callback);
  }

  public async callEvent(event: Event, context: Context, ...args: any[]): Promise<any> {
    return this.events.callEvent(event, context, ...args);
  }
}

export default Lifecycle;

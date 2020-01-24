import Context from '@/lib/Context';

export enum Event {
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
  handlerDidHandle,
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

export type Callback<B> = (context: Context<B>, ...args: any[]) => any | Promise<any>;

export type Events<B> = { [key in keyof typeof Event]?: Callback<B> };

class Lifecycle<B> {
  private events: Events<B> = {};

  public setEvent(event: Event, callback: Callback<B>) {
    this.events[event] = callback;
  }

  public getEvent(event: Event): Callback<B> {
    return this.events[event] ?? (() => {});
  }

  public async callEvent(event: Event, context: Context<B>, ...args: any[]): Promise<any> {
    return this.getEvent(event)(context, ...args);
  }
}

export abstract class AbstractLifecycle<B> {
  constructor(protected events: Lifecycle<B> = new Lifecycle()) {}

  public setEvent(event: Event, callback: Callback<B>) {
    this.events.setEvent(event, callback);
  }

  public async callEvent(event: Event, context: Context<B>, ...args: any[]): Promise<any> {
    return this.events.callEvent(event, context, ...args);
  }
}

export default Lifecycle;

import Context from '../Context';

import { EventType, Callback, EventCallbackMap } from './types';

export { EventType as Event, EventCallbackMap, Callback as EventCallback };

class Lifecycle {
  private events: Partial<EventCallbackMap> = {};

  public setEvent<K extends keyof EventCallbackMap>(type: K, callback: Callback<K>) {
    this.events[type] = callback;
  }

  public getEvent<K extends keyof EventCallbackMap>(type: K): Callback<K> | undefined {
    return (this.events as EventCallbackMap)[type];
  }

  public async callEvent<K extends keyof EventCallbackMap>(type: K, context: Context, event: Parameters<Callback<K>>[1]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    await this.getEvent<K>(type)?.(context, event);
  }
}

export abstract class AbstractLifecycle {
  constructor(protected events: Lifecycle = new Lifecycle()) {}

  public setEvent<K extends keyof EventCallbackMap>(type: K, callback: Callback<K>) {
    this.events.setEvent<K>(type, callback);
  }

  public async callEvent<K extends keyof EventCallbackMap>(type: K, context: Context, event: Parameters<Callback<K>>[1]) {
    await this.events.callEvent<K>(type, context, event);
  }
}

export default Lifecycle;

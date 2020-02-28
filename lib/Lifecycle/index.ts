import Context from '../Context';
import { Callback, Event, EventCallbackMap, EventType } from './types';

export { EventType, Event, EventCallbackMap, Callback as EventCallback };

class Lifecycle {
  private events: Partial<EventCallbackMap> = {};

  public setEvent<K extends EventType>(type: K, callback: Callback<K>) {
    this.events[type] = callback;
  }

  public getEvent<K extends EventType>(type: K): Callback<K> | undefined {
    return (this.events as EventCallbackMap)[type];
  }

  public async callEvent<K extends EventType>(type: K, context: Context, event: Event<K>): Promise<void> {
    await this.getEvent<K>(type)?.({ ...event, context });
  }
}

export abstract class AbstractLifecycle {
  constructor(protected events: Lifecycle = new Lifecycle()) {}

  public setEvent<K extends EventType>(type: K, callback: Callback<K>) {
    this.events.setEvent<K>(type, callback);
  }

  public async callEvent<K extends EventType>(type: K, context: Context, event: Event<K>) {
    await this.events.callEvent<K>(type, context, event);
  }
}

export default Lifecycle;

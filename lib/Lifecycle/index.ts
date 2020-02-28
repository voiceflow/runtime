import Context from '@/lib/Context';

import { EventCallback, EventType } from './types';

export { EventType as Event, EventCallback as Callback };

class Lifecycle {
  private events: { [key in EventType]?: EventCallback } = {};

  public setEvent(event: EventType, callback: EventCallback) {
    this.events[event] = callback;
  }

  public getEvent(event: EventType): EventCallback {
    return this.events[event] ?? (() => undefined);
  }

  public async callEvent(event: EventType, context: Context, payload: any): Promise<any> {
    await this.getEvent(event)(context, payload);
  }
}

export abstract class AbstractLifecycle {
  constructor(protected events: Lifecycle = new Lifecycle()) {}

  public setEvent(event: EventType, callback: EventCallback) {
    this.events.setEvent(event, callback);
  }

  public async callEvent(eventType: EventType, context: Context, payload: any = {}) {
    await this.events.callEvent(eventType, context, payload);
  }
}

export default Lifecycle;

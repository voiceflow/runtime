import { CallEvent, EventAction, EventType, SetEvent } from './types';

export { EventType as Event, EventAction as Callback, CallEvent, SetEvent };

class Lifecycle {
  private events: { [key in EventType]?: any } = {};

  public setEvent({ type, action }: SetEvent) {
    this.events[type] = action;
  }

  public getEvent(type: EventType): EventAction | any {
    return this.events[type] ?? (() => undefined);
  }

  public async callEvent({ type, context, event = {} }: CallEvent): Promise<void> {
    await this.getEvent(type)(context, event);
  }
}

export abstract class AbstractLifecycle {
  constructor(protected events: Lifecycle = new Lifecycle()) {}

  public setEvent(set: SetEvent) {
    this.events.setEvent(set);
  }

  public async callEvent(call: CallEvent) {
    await this.events.callEvent(call);
  }
}

export default Lifecycle;

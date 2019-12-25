import Event from '@/lib/event';

export type Events = { [key in keyof typeof Event]?: Function};

class Lifecycle {
  private events: Events = {};

  public setEvents(events: Events): void {
    this.events = events;
  }

  public setEvent(event: Event, callback: Function) {
    this.events[event] = callback;
  }

  public getEvent(event: Event): Function {
    return this.events[event] ?? (() => {});
  };

  public getEvents(): Events  {
    return this.events;
  }
};

export default Lifecycle;

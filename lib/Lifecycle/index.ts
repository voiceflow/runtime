import Events from '@/lib/events';

class Lifecycle {
  private events: { [key in keyof typeof Events]?: Function} = {};

  public setEvent(event: Events, callback: Function) {
    this.events[event] = callback;
  }

  public getEvent(event: Events): Function {
    return this.events[event] ?? (() => {});
  };
};

export default Lifecycle;

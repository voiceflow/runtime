import Context from '@/lib/Context';
import Lifecycle from '@/lib/Lifecycle';

interface Options {
  secret: string,
  endpoint: string,
  handlers: Handler[],
}

class Controller extends Lifecycle {
  secret: string;
  endpoint: string;
  handlers: Hander[] = [];

  constructor({ secret, handlers, endpoint = 'https://data.voiceflow.com'}: Options) {
    super();
    this.secret = secret;
    this.handlers = handlers;
    this.endpoint = endpoint;
  }

  public createContext(versionID: string, state: object): Context {
    return new Context(versionID, state, this);
  }

  public getHandlers(): Handler[] {
    return this.handlers;
  }
}

export default Controller;

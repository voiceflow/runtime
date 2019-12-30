import Context, { State as ContextState, Options as ContextOptions } from '@/lib/Context';
import { AbstractLifecycle } from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller extends AbstractLifecycle {
  private options: ContextOptions;

  constructor({ secret, endpoint = DEFAULT_ENDPOINT, handlers = [] }: ContextOptions) {
    super();

    this.options = {
      secret,
      endpoint,
      handlers,
    };
  }

  public createContext(versionID: string, state: ContextState): Context {
    

    const context = new Context(versionID, state, this.options, this.events);

    return context;
  }
}

export default Controller;

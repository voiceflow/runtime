import Context, { State as ContextState, Options as ContextOptions, Request } from '@/lib/Context';
import { DefaultHandlers } from '@/lib/Handler';
import { AbstractLifecycle } from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller extends AbstractLifecycle {
  private options: ContextOptions;

  constructor({ secret, endpoint = DEFAULT_ENDPOINT, handlers = [], stateHandlers = [] }: ContextOptions) {
    super();

    this.options = {
      secret,
      endpoint,
      handlers: [...handlers, ...DefaultHandlers],
      stateHandlers,
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request): Context {
    const context = new Context(versionID, state, request, this.options, this.events);

    return context;
  }
}

export default Controller;

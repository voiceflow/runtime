import Context, { Options as ContextOptions, State as ContextState } from '@/lib/Context';
import Request from '@/lib/Context/Request';
import { AbstractLifecycle } from '@/lib/Lifecycle';

class Controller extends AbstractLifecycle {
  private options: Pick<ContextOptions, 'api' | 'handlers' | 'services'>;

  constructor({ api, handlers = [], services = {} }: ContextOptions) {
    super();

    this.options = {
      api,
      handlers,
      services,
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request, options?: ContextOptions): Context {
    return new Context(versionID, state, request, { ...this.options, ...options }, this.events);
  }
}

export default Controller;

import Context, { Options as ContextOptions, State as ContextState } from '@/lib/Context';
import Request from '@/lib/Context/Request';
import { DataAPI } from '@/lib/DataAPI';
import { AbstractLifecycle } from '@/lib/Lifecycle';

class Controller<D extends DataAPI = DataAPI> extends AbstractLifecycle {
  private options: Pick<ContextOptions<D>, 'api' | 'handlers' | 'services'>;

  constructor({ api, handlers = [], services = {} }: ContextOptions<D>) {
    super();

    this.options = {
      api,
      handlers,
      services,
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request, options?: ContextOptions<D>): Context<D> {
    return new Context<D>(versionID, state, request, { ...this.options, ...options }, this.events);
  }
}

export default Controller;

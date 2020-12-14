import Context, { Options as ContextOptions, State as ContextState } from '@/lib/Context';
import { DataAPI } from '@/lib/DataAPI';
import { AbstractLifecycle } from '@/lib/Lifecycle';

class Controller<I extends Record<string, unknown> = Record<string, unknown>, D extends DataAPI = DataAPI> extends AbstractLifecycle {
  private options: Pick<ContextOptions<D>, 'api' | 'handlers' | 'services'>;

  constructor({ api, handlers = [], services = {} }: ContextOptions<D>) {
    super();

    this.options = {
      api,
      handlers,
      services,
    };
  }

  public createContext(versionID: string, state: ContextState, input?: I, options?: ContextOptions<D>): Context<I, D> {
    return new Context<I, D>(versionID, state, input, { ...this.options, ...options }, this.events);
  }
}

export default Controller;

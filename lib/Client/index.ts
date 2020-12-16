import { DataAPI } from '@/lib/DataAPI';
import { AbstractLifecycle } from '@/lib/Lifecycle';
import Runtime, { Options as RuntimeOptions, State as RuntimeState } from '@/lib/Runtime';

class Controller<I extends Record<string, unknown> = Record<string, unknown>, D extends DataAPI = DataAPI> extends AbstractLifecycle {
  private options: Pick<RuntimeOptions<D>, 'api' | 'handlers' | 'services'>;

  constructor({ api, handlers = [], services = {} }: RuntimeOptions<D>) {
    super();

    this.options = {
      api,
      handlers,
      services,
    };
  }

  public createRuntime(versionID: string, state: RuntimeState, input?: I, options?: RuntimeOptions<D>): Runtime<I, D> {
    return new Runtime<I, D>(versionID, state, input, { ...this.options, ...options }, this.events);
  }
}

export default Controller;

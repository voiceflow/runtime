import Context, { State as ContextState, Options as ContextOptions } from '@/lib/Context';
import Lifecycle from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller extends Lifecycle {
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
    const context = new Context(versionID, state, this.options);

    context.setEvents(this.getEvents());

    return context;
  }
}

export default Controller;

import Context, { Options as ContextOptions, State as ContextState } from '@/lib/Context';
import Request from '@/lib/Context/Request';
import Handler, { DefaultBlock, DefaultHandlers } from '@/lib/Handler';
import { AbstractLifecycle } from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller<B extends {} | {}> extends AbstractLifecycle<B | DefaultBlock> {
  private options: {
    secret?: string;
    endpoint?: string;
    handlers: Handler<B | DefaultBlock>[];
  };

  constructor({ secret, endpoint = DEFAULT_ENDPOINT, handlers = [] }: ContextOptions<B>) {
    super();

    this.options = {
      secret,
      endpoint,
      handlers: [...handlers, ...DefaultHandlers] as Handler<B | DefaultBlock>[],
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request) {
    return new Context<B | DefaultBlock>(versionID, state, request, this.options, this.events);
  }
}

export default Controller;

import Context, { Options as ContextOptions, State as ContextState } from '@/lib/Context';
import Request from '@/lib/Context/Request';
import { DefaultBlock, DefaultHandlers, Handler } from '@/lib/Handler';
import { AbstractLifecycle } from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller<B extends { [key: string]: any } = {}> extends AbstractLifecycle<B | DefaultBlock> {
  private options: ContextOptions<B> & {
    handlers: Handler<B>[] & Handler<DefaultBlock>[];
  };

  constructor({ secret, endpoint = DEFAULT_ENDPOINT, handlers = [], stateHandlers = [] }: ContextOptions<B>) {
    super();

    this.options = {
      secret,
      endpoint,
      handlers: [...handlers, ...DefaultHandlers],
      stateHandlers,
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request): Context<B | DefaultBlock> {
    return new Context<DefaultBlock>(versionID, state, request, this.options, this.events);
  }
}

export default Controller;

import Context, { State as ContextState, Options as ContextOptions } from '@/lib/Context';
import Request from '@/lib/Context/Request';
import { DefaultHandlers, DefaultBlock } from '@/lib/Handler';
import { AbstractLifecycle } from '@/lib/Lifecycle';
import { Handler } from '@/lib/Handler';

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
      // @ts-ignore
      handlers: [...handlers, ...DefaultHandlers],
      stateHandlers,
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request): Context<B | DefaultBlock> {
    const context = new Context<DefaultBlock>(versionID, state, request, this.options, this.events);

    return context;
  }
}

export default Controller;

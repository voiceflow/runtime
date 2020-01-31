import Context, { Options as ContextOptions, State as ContextState } from '@/lib/Context';
import Request from '@/lib/Context/Request';
import Handler, { DefaultBlock, DefaultHandlers } from '@/lib/Handler';
import { AbstractLifecycle } from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller<B extends { [key: string]: any } = {}> extends AbstractLifecycle<B | DefaultBlock> {
  private options: ContextOptions<B> & {
    handlers: Handler<B>[] & Handler<DefaultBlock>[];
  };

  constructor({ secret, endpoint = DEFAULT_ENDPOINT, handlers = [] }: ContextOptions<B>) {
    super();

    this.options = {
      secret,
      endpoint,
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      handlers: [...handlers, ...DefaultHandlers],
    };
  }

  public createContext(versionID: string, state: ContextState, request?: Request): Context<B | DefaultBlock> {
    return new Context<DefaultBlock>(versionID, state, request, this.options, this.events);
  }
}

export default Controller;

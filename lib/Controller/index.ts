import Context, { State, Options } from '@/lib/Context';
import Lifecycle from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

class Controller extends Lifecycle {
  private options: Options;

  constructor({secret, endpoint = DEFAULT_ENDPOINT, handlers = []}: Options) {
    super();
    this.options = {
      secret,
      endpoint,
      handlers,
    };
  }

  public createContext(versionID: string, { turn, ...state }: State): Context {
    return new Context(versionID, state, this.options);
  }
}

export default Controller;

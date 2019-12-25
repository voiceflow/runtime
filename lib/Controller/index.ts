import Context, { State, Options } from '@/lib/Context';
import Lifecycle from '@/lib/Lifecycle';

const DEFAULT_ENDPOINT = 'https://data.voiceflow.com';

type ObjectState = State<object, object, object, object, object, object>;
type ObjectContext = Context<object, object, object, object, object, object>;

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

  public createContext(versionID: string, state: ObjectState): ObjectContext  {
    state.turn = {};
    const context = new Context(versionID, state, this.options);
    context.setEvents(this.getEvents());
    return context;
  }
}

export default Controller;

import axios from 'axios';
import _produce from 'immer';

import Lifecycle from '@/lib/Lifecycle';
import Store from './Store';
import Handler from '@/lib/Handler';
import Stack, { FrameState } from './Stack';

export interface Options {
  secret: string,
  endpoint: string,
  handlers: Handler[],
}

export interface State {
  storage: object;
  variables: object;
  turn?: object;
  stack: FrameState[];
}

class Context extends Lifecycle {
  // storage variables
  public storage: Store = new Store();
  // global variables
  public variables: Store = new Store();
  // temporary turn variables
  public turn: Store = new Store();

  public stack: Stack = new Stack();

  private hasUpdated: boolean = false;

  constructor(public versionID: string, state: State, private options: Options) {
    super();
    this.initialize(state);
  }

  async fetchMetadata(): Promise<object> {
    const { body }: { body: object } = await axios.get(`${this.options.endpoint}/metadata/${this.versionID}`, {
      headers: {
        authorization: this.options.secret
      }
    });

    return body;
  }

  async fetchDiagram(diagramID: string): Promise<object> {
    const { body }: { body: object } = await axios.get(`${this.options.endpoint}/diagrams/${diagramID}`, {
      headers: {
        authorization: this.options.secret
      }
    });

    return body;
  }

  async update(): Promise<void> {
    if (this.hasUpdated) {
      throw new Error('Context Updated Twice');
    }
    this.hasUpdated = true;
  }

  initialize(state: State): void {
    this.storage.initialize(state.storage);
    this.turn.initialize(state.turn);
    this.variables.initialize(state.variables);
    this.stack.initialize(state.stack);
  }

  getState = (): State => ({
    storage: this.storage.getState(),
    turn: this.turn.getState(),
    variables: this.variables.getState(),
    stack: this.stack.getState(),
  });

  produce(producer): void {
    this.initialize(_produce(this.getState(), producer));
  };
};

export default Context;

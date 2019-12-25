import axios from 'axios';
import produce, { Draft } from 'immer';

import Lifecycle from '@/lib/Lifecycle';
import Store from './Store';
import Handler from '@/lib/Handler';
import Stack, { FrameState } from './Stack';

import cycleStack from "@/lib/Context/cycleStack";

export interface Options {
  secret: string,
  endpoint: string,
  handlers: Handler[],
}

export interface State<T, S, V, STT, STV, STS> {
  turn: T;
  stack: FrameState<STT, STV, STS>[];
  storage: S;
  variables: V;
}

export enum ActionType {
  IDLE,
  RUNNING,
  PUSHING,
  POPPING,
  ENDING,
  END,
}

export interface Action {
  type: ActionType,
  payload?: object,
}

class Context<T, S, V, STT, STV, STS> extends Lifecycle {
  // temporary turn variables
  public turn: Store<T> = new Store();
  // storage variables
  public storage: Store<S> = new Store();
  // global variables
  public variables: Store<V> = new Store();

  public stack: Stack<STT, STV, STS> = new Stack([]);

  private action: Action = { type: ActionType.IDLE };

  constructor(public versionID: string, state: State<T, S, V, STT, STV, STS>, private options: Options) {
    super();
    this.initialize(state);
  }

  setAction(type: ActionType, payload?: object): void {
    this.action = {
      type,
      payload
    };
  }

  getAction(): Action {
    return this.action;
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
    if (this.action.type !== ActionType.IDLE) {
      throw new Error('Context Updated Twice');
    }
    this.setAction(ActionType.RUNNING);
    await cycleStack(this);
  }

  initialize(state: State<T, S, V, STT, STV, STS>): void {
    this.turn.initialize(state.turn);
    this.stack.initialize(state.stack);
    this.storage.initialize(state.storage);
    this.variables.initialize(state.variables);
  }

  getState = (): State<T, S, V, STT, STV, STS> => ({
    storage: this.storage.getState(),
    turn: this.turn.getState(),
    variables: this.variables.getState(),
    stack: this.stack.getState(),
  });

  produce(producer: (draft: Draft<State<T, S, V, STT, STV, STS>>) => void): void {
    this.initialize(produce(this.getState(), producer));
  };
};

export default Context;

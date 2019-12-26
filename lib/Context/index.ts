import axios, { AxiosInstance } from 'axios';
import produce, { Draft } from 'immer';

import Lifecycle from '@/lib/Lifecycle';
import Store, { State as StorageState } from './Store';
import Handler from '@/lib/Handler';
import Stack, { FrameState } from './Stack';

import cycleStack from '@/lib/Context/cycleStack';

export interface Options {
  secret: string;
  endpoint: string;
  handlers: Handler[];
}

export interface State {
  turn: StorageState;
  stack: FrameState[];
  storage: StorageState;
  variables: StorageState;
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
  type: ActionType;
  payload?: object;
}

class Context extends Lifecycle {
  // temporary turn variables
  public turn: Store;

  public stack: Stack;

  // storage variables
  public storage: Store;

  // global variables
  public variables: Store;

  private action: Action = { type: ActionType.IDLE };

  private fetch: AxiosInstance;

  constructor(public versionID: string, state: State, private options: Options) {
    super();

    this.turn = new Store(state.turn);
    this.stack = new Stack(state.stack);
    this.storage = new Store(state.storage);
    this.variables = new Store(state.variables);

    this.fetch = axios.create({
      baseURL: this.options.endpoint,
      headers: {
        authorization: this.options.secret,
      },
    });
  }

  setAction(type: ActionType, payload?: object): void {
    this.action = { type, payload };
  }

  getAction(): Action {
    return this.action;
  }

  async fetchMetadata(): Promise<object> {
    const { body }: { body: object } = await this.fetch.get(`/metadata/${this.versionID}`);

    return body;
  }

  async fetchDiagram(diagramID: string): Promise<object> {
    const { body }: { body: object } = await this.fetch.get(`/diagrams/${diagramID}`);

    return body;
  }

  async update(): Promise<void> {
    if (this.action.type !== ActionType.IDLE) {
      throw new Error('Context Updated Twice');
    }

    this.setAction(ActionType.RUNNING);

    await cycleStack(this);
  }

  getState = (): State => ({
    turn: this.turn.getState(),
    stack: this.stack.getState(),
    storage: this.storage.getState(),
    variables: this.variables.getState(),
  });

  produce(producer: (draft: Draft<State>) => void): void {
    const { turn, stack, storage, variables } = produce(this.getState(), producer);

    this.turn.update(turn);
    this.stack.update(stack);
    this.storage.update(storage);
    this.variables.update(variables);
  }
}

export default Context;

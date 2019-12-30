import axios, { AxiosInstance } from 'axios';
import produce, { Draft } from 'immer';

import Lifecycle, { Event, AbstractLifecycle } from '@/lib/Lifecycle';

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

export interface Action<P = object> {
  type: ActionType;
  payload?: P;
}

class Context extends AbstractLifecycle {
  // temporary turn variables
  public turn: Store;

  public stack: Stack;

  // storage variables
  public storage: Store;

  // global variables
  public variables: Store;

  private action: Action = { type: ActionType.IDLE };

  private fetch: AxiosInstance;

  constructor(public versionID: string, state: State, private options: Options, events: Lifecycle) {
    super(events);

    this.stack = new Stack(state.stack, {
      didPop: (...args) => this.callEvent(Event.stackDidPop, this, ...args),
      willPop: (...args) => this.callEvent(Event.stackWillPop, this, ...args),
      didPush: (...args) => this.callEvent(Event.stackDidPush, this, ...args),
      willPush: (...args) => this.callEvent(Event.stackWillPush, this, ...args),
    });

    this.turn = new Store(state.turn, {
      didUpdate: (...args) => this.callEvent(Event.turnDidUpdate, this, ...args),
      willUpdate: (...args) => this.callEvent(Event.turnWillUpdate, this, ...args),
    });
    this.storage = new Store(state.storage, {
      didUpdate: (...args) => this.callEvent(Event.storageDidUpdate, this, ...args),
      willUpdate: (...args) => this.callEvent(Event.storageWillUpdate, this, ...args),
    });
    this.variables = new Store(state.variables, {
      didUpdate: (...args) => this.callEvent(Event.variablesDidUpdate, this, ...args),
      willUpdate: (...args) => this.callEvent(Event.variablesWillUpdate, this, ...args),
    });

    this.fetch = axios.create({
      baseURL: this.options.endpoint,
      headers: {
        authorization: this.options.secret,
      },
    });
  }

  public setAction(type: ActionType, payload?: object): void {
    this.action = { type, payload };
  }

  public getAction(): Action {
    return this.action;
  }

  public async fetchMetadata<T = object>(): Promise<T> {
    const { body }: { body: T } = await this.fetch.get(`/metadata/${this.versionID}`);

    return body;
  }

  public async fetchDiagram<T = object>(diagramID: string): Promise<T> {
    this.callEvent(Event.diagramWillFetch, this, diagramID);

    const { body }: { body: T } = await this.fetch.get(`/diagrams/${diagramID}`);

    this.callEvent(Event.diagramDidFetch, this, diagramID, body);

    return body;
  }

  public async update(): Promise<void> {
    try {
      this.callEvent(Event.updateWillExecute, this);

      if (this.action.type !== ActionType.IDLE) {
        throw new Error('Context Updated Twice');
      }

      this.setAction(ActionType.RUNNING);

      await cycleStack(this);

      this.callEvent(Event.updateDidExecute, this);
    } catch (e) {
      this.callEvent(Event.updateDidCatch, this, e);
    }
  }

  public getState(): State {
    return {
      turn: this.turn.getState(),
      stack: this.stack.getState(),
      storage: this.storage.getState(),
      variables: this.variables.getState(),
    };
  }

  public produce(producer: (draft: Draft<State>) => void): void {
    const { turn, stack, storage, variables } = produce(this.getState(), producer);

    this.turn.update(turn);
    this.stack.update(stack);
    this.storage.update(storage);
    this.variables.update(variables);
  }
}

export default Context;

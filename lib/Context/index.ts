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

    const createEvent = (eventName: Event) => (...args: any[]) => this.callEvent(eventName, this, ...args);

    this.stack = new Stack(state.stack, {
      didPop: createEvent(Event.stackDidPop),
      willPop: createEvent(Event.stackWillPop),
      didPush: createEvent(Event.stackDidPush),
      willPush: createEvent(Event.stackWillPush),
    });

    this.turn = new Store(state.turn, {
      didUpdate: createEvent(Event.turnDidUpdate),
      willUpdate: createEvent(Event.turnWillUpdate),
    });

    this.storage = new Store(state.storage, {
      didUpdate: createEvent(Event.storageDidUpdate),
      willUpdate: createEvent(Event.storageWillUpdate),
    });

    this.variables = new Store(state.variables, {
      didUpdate: createEvent(Event.variablesDidUpdate),
      willUpdate: createEvent(Event.variablesWillUpdate),
    });

    this.fetch = axios.create({
      baseURL: this.options.endpoint,
      headers: { authorization: this.options.secret },
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

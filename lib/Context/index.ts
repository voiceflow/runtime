import axios, { AxiosInstance } from 'axios';
import produce, { Draft } from 'immer';

import Lifecycle, { Event, AbstractLifecycle } from '@/lib/Lifecycle';

import Store, { State as StorageState } from './Store';
import Handler, { StateHandler } from '@/lib/Handler';
import Stack, { FrameState } from './Stack';

import Diagram from '@/lib/Diagram';

import cycleStack from '@/lib/Context/cycleStack';

export interface Options {
  secret: string;
  endpoint: string;
  handlers: Handler[];
  stateHandlers: StateHandler[],
}

export interface State {
  output: string;
  turn: StorageState;
  stack: FrameState[];
  storage: StorageState;
  variables: StorageState;
}

export interface Request {
  type: string;
  payload: object;
}

export enum Action {
  IDLE,
  RUNNING,
  PROMPT,
  END,
}

class Context extends AbstractLifecycle {
  // temporary turn variables
  public turn: Store;

  public stack: Stack;

  // storage variables
  public storage: Store;

  // global variables
  public variables: Store;

  private action: Action = Action.IDLE;

  private fetch: AxiosInstance;

  public output: string;

  constructor(public versionID: string, state: State, private request: Request, private options: Options, events: Lifecycle) {
    super(events);

    const createEvent = (eventName: Event) => (...args: any[]) => this.callEvent(eventName, ...args);

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

  getRequest(): Request {
    return this.request;
  }

  public setAction(type: Action): void {
    this.action = type;
  }

  public getAction(): Action {
    return this.action;
  }

  public async fetchMetadata<T = object>(): Promise<T> {
    const { body }: { body: T } = await this.fetch.get(`/metadata/${this.versionID}`);

    return body;
  }

  async callEvent(event: Event, ...args): Promise<any> {
    return super.callEvent(event, this, ...args);
  }

  public async fetchDiagram(diagramID: string): Promise<Diagram> {
    this.callEvent(Event.diagramWillFetch, diagramID);

    const { body }: { body: object } = await this.fetch.get(`/diagrams/${diagramID}`);

    let diagram = new Diagram(body);

    this.callEvent(Event.diagramDidFetch, diagramID, diagram);

    return diagram;
  }

  public async update(): Promise<void> {
    try {
      this.callEvent(Event.updateWillExecute);

      if (this.action !== Action.IDLE) {
        throw new Error('Context Updated Twice');
      }

      this.setAction(Action.RUNNING);
      await cycleStack(this);

      this.callEvent(Event.updateDidExecute);
    } catch (error) {
      this.callEvent(Event.updateDidCatch, error);
    }
  }

  public getState(): State {
    return {
      output: this.output,
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

  public getHandlers(): Handler[] {
    return this.options.handlers;
  }

  public getStateHandlers(): StateHandler[] {
    return this.options.stateHandlers;
  }
}

export default Context;

import axios, { AxiosInstance } from 'axios';

import cycleStack from '@/lib/Context/cycleStack';
import Handler from '@/lib/Handler';
import Lifecycle, { AbstractLifecycle, Event, EventType } from '@/lib/Lifecycle';

import Request from './Request';
import Stack, { FrameState } from './Stack';
import Store, { State as StorageState } from './Store';
import Trace from './Trace';
import DiagramManager from './utils/diagramManager';

export interface Options {
  secret?: string;
  endpoint?: string;
  handlers?: Handler[];
  services?: Record<string, any>;
}

export interface State {
  turn?: StorageState;
  stack: FrameState[];
  storage: StorageState;
  variables: StorageState;
}

export enum Action {
  IDLE,
  RUNNING,
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

  public trace: Trace;

  // services
  public services: Record<string, any>;

  private fetch: AxiosInstance;

  private action: Action = Action.IDLE;

  private handlers: Handler[];

  private diagramManager: DiagramManager;

  constructor(
    public versionID: string,
    state: State,
    private request: Request | null = null,
    { services = {}, endpoint, secret, handlers = [] }: Options = {},
    events: Lifecycle
  ) {
    super(events);

    const createEvent = <K extends EventType>(type: K) => (event: Event<K>) => this.callEvent(type, event);

    this.services = services;
    this.handlers = handlers;

    this.stack = new Stack(state.stack, {
      willChange: createEvent(EventType.stackWillChange),
      didChange: createEvent(EventType.stackDidChange),
    });

    this.turn = new Store(state.turn, {
      didUpdate: createEvent(EventType.turnDidUpdate),
      willUpdate: createEvent(EventType.turnWillUpdate),
    });

    this.storage = new Store(state.storage, {
      didUpdate: createEvent(EventType.storageDidUpdate),
      willUpdate: createEvent(EventType.storageWillUpdate),
    });

    this.variables = new Store(state.variables, {
      didUpdate: createEvent(EventType.variablesDidUpdate),
      willUpdate: createEvent(EventType.variablesWillUpdate),
    });

    this.fetch = axios.create({
      baseURL: endpoint,
      headers: { authorization: `Bearer ${secret}` },
    });

    this.trace = new Trace(this);

    this.diagramManager = new DiagramManager(this, this.fetch);
  }

  getRequest(): Request | null {
    return this.request;
  }

  public setAction(type: Action): void {
    this.action = type;
  }

  public getAction(): Action {
    return this.action;
  }

  public end(): void {
    this.setAction(Action.END);
  }

  public hasEnded(): boolean {
    return this.getAction() === Action.END;
  }

  public async fetchMetadata<T = object>(): Promise<T> {
    const { data }: { data: T } = await this.fetch.get(`/metadata/${this.versionID}`);

    return data;
  }

  public async callEvent<K extends EventType>(type: K, event: Event<K>) {
    await super.callEvent<K>(type, event, this);
  }

  public getDiagram(diagramID: string) {
    return this.diagramManager.getDiagram(diagramID);
  }

  public async update(): Promise<void> {
    try {
      await this.callEvent(EventType.updateWillExecute, {});

      if (this.action !== Action.IDLE) {
        throw new Error('context updated twice');
      }

      this.setAction(Action.RUNNING);
      await cycleStack(this);

      await this.callEvent(EventType.updateDidExecute, {});
    } catch (error) {
      await this.callEvent(EventType.updateDidCatch, { error });
    }
  }

  public getFinalState(): State {
    if (this.action === Action.IDLE) {
      throw new Error('context not updated');
    }

    return {
      stack: this.stack.getState(),
      storage: this.storage.getState(),
      variables: this.variables.getState(),
    };
  }

  public getRawState(): State {
    return {
      turn: this.turn.getState(),
      stack: this.stack.getState(),
      storage: this.storage.getState(),
      variables: this.variables.getState(),
    };
  }

  // public produce(producer: (draft: Draft<State>) => void): void {
  //   const { turn, stack, storage, variables } = produce(this.getState(), producer);
  //
  //   this.turn.update(turn);
  //   this.stack.update(stack);
  //   this.storage.update(storage);
  //   this.variables.update(variables);
  // }

  public getHandlers(): Handler[] {
    return this.handlers;
  }
}

export default Context;

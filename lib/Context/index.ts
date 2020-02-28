import axios, { AxiosInstance } from 'axios';

import cycleStack from '@/lib/Context/cycleStack';
import Handler from '@/lib/Handler';
import Lifecycle, { AbstractLifecycle, Event, EventCallbackMap } from '@/lib/Lifecycle';

import Request from './Request';
import Stack, { FrameState } from './Stack';
import Store, { State as StorageState } from './Store';
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

export interface TraceFrame {
  type: string;
  payload: any;
}

class Context extends AbstractLifecycle {
  // temporary turn variables
  public turn: Store;

  public stack: Stack;

  // storage variables
  public storage: Store;

  // global variables
  public variables: Store;

  // services
  public services: Record<string, any>;

  private fetch: AxiosInstance;

  private action: Action = Action.IDLE;

  private handlers: Handler[];

  private diagramManager: DiagramManager;

  private trace: TraceFrame[] = [];

  constructor(
    public versionID: string,
    state: State,
    private request: Request | null = null,
    { services = {}, endpoint, secret, handlers = [] }: Options = {},
    events: Lifecycle
  ) {
    super(events);

    const createEvent = <K extends keyof EventCallbackMap>(type: K) => (event: Parameters<EventCallbackMap[K]>[1]) => this.callEvent(type, event);

    this.services = services;
    this.handlers = handlers;

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
      baseURL: endpoint,
      headers: { authorization: `Bearer ${secret}` },
    });

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

  public async callEvent<K extends keyof EventCallbackMap>(type: K, event: Parameters<EventCallbackMap[K]>[1]) {
    await super.callEvent<K>(type, this, event);
  }

  public getDiagram(diagramID: string) {
    return this.diagramManager.getDiagram(diagramID);
  }

  public async update(): Promise<void> {
    try {
      await this.callEvent(Event.updateWillExecute, {});

      if (this.action !== Action.IDLE) {
        throw new Error('context updated twice');
      }

      this.setAction(Action.RUNNING);
      await cycleStack(this);

      await this.callEvent(Event.updateDidExecute, {});
    } catch (error) {
      await this.callEvent(Event.updateDidCatch, { error });
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

  public addTrace = async (traceFrame: TraceFrame) => {
    let stop = false;

    await this.callEvent(Event.traceWillAdd, {
      frame: traceFrame,
      stop: () => {
        stop = true;
      },
    });

    if (stop) return;

    this.trace = [...this.trace, traceFrame];
  };

  public getTrace = () => {
    return this.trace;
  };

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

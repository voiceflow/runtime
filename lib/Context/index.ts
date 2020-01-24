import axios, { AxiosInstance } from 'axios';

import cycleStack from '@/lib/Context/cycleStack';
import Diagram from '@/lib/Diagram';
import Handler from '@/lib/Handler';
// import produce, { Draft } from 'immer';
import Lifecycle, { AbstractLifecycle, Event } from '@/lib/Lifecycle';

import Request from './Request';
import Stack, { FrameState } from './Stack';
import Store, { State as StorageState } from './Store';

export interface Options<B> {
  secret?: string;
  endpoint?: string;
  handlers?: Handler<B>[];
  stateHandlers?: Handler<B>[];
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

class Context<B> extends AbstractLifecycle<B> {
  // temporary turn variables
  public turn: Store;

  public stack: Stack;

  // storage variables
  public storage: Store;

  // global variables
  public variables: Store;

  private action: Action = Action.IDLE;

  private fetch: AxiosInstance;

  constructor(public versionID: string, state: State, private request: Request | null = null, private options: Options<B>, events: Lifecycle<B>) {
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
      headers: { authorization: `Bearer ${this.options.secret}` },
    });
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

  async callEvent(event: Event, ...args: any[]): Promise<any> {
    return super.callEvent(event, this, ...args);
  }

  public async fetchDiagram(diagramID: string): Promise<Diagram<B>> {
    this.callEvent(Event.diagramWillFetch, diagramID);

    const { data }: { data: Record<string, any> } = await this.fetch.get(`/diagrams/${diagramID}`);

    const diagram = new Diagram<B>({
      id: diagramID,
      startBlockID: data.startId,
      variables: data.variables,
      blocks: data.lines,
      commands: data.commands,
    });

    this.callEvent(Event.diagramDidFetch, diagramID, diagram);

    return diagram;
  }

  public async update(): Promise<void> {
    try {
      await this.callEvent(Event.updateWillExecute);

      if (this.action !== Action.IDLE) {
        throw new Error('Context Updated Twice');
      }

      this.setAction(Action.RUNNING);
      await cycleStack<B>(this);

      await this.callEvent(Event.updateDidExecute);
    } catch (error) {
      await this.callEvent(Event.updateDidCatch, error);
    }
  }

  public getFinalState(): State {
    if (this.action === Action.IDLE) {
      throw new Error('Context Not Updated');
    }

    return {
      stack: this.stack.getState(),
      storage: this.storage.getState(),
      variables: this.variables.getState(),
    };
  }

  // public getState(): State {
  //   return {
  //     turn: this.turn.getState(),
  //     stack: this.stack.getState(),
  //     storage: this.storage.getState(),
  //     variables: this.variables.getState(),
  //   };
  // }

  // public produce(producer: (draft: Draft<State>) => void): void {
  //   const { turn, stack, storage, variables } = produce(this.getState(), producer);
  //
  //   this.turn.update(turn);
  //   this.stack.update(stack);
  //   this.storage.update(storage);
  //   this.variables.update(variables);
  // }

  public getHandlers(): Handler<B>[] {
    return this.options.handlers ?? [];
  }

  public getStateHandlers(): Handler<B>[] {
    return this.options.stateHandlers ?? [];
  }
}

export default Context;

import produce, { Draft } from 'immer';

export type State = { readonly [k: string]: any };

type DidUpdate = (prevState: State, state: State) => void;
type WillUpdate = (state: State, nextState: State) => void;

class Store {
  private store: State = {};
  private readonly didUpdate: DidUpdate;
  private readonly willUpdate: WillUpdate;

  constructor(payload: State = {}, { didUpdate, willUpdate }: { didUpdate?: DidUpdate; willUpdate?: WillUpdate } = {}) {
    this.store = { ...payload };

    this.didUpdate = didUpdate;
    this.willUpdate = willUpdate;
  }

  // initialize all provided variables
  public initialize(keys: string[], value: any = 0 ) {
    this.produce((store: object) => {
      keys.forEach((key) => {
        if (store[key] === undefined) {
          store[key] = value;
        }
      })
    });
  }

  public getState(): State {
    return this.store;
  }

  public get<K extends keyof State>(key: K): State[K] {
    return this.store[key];
  }

  public update(nextState: State): void {
    const prevState = this.store;

    this.willUpdate(this.store, nextState);

    this.store = nextState;

    this.didUpdate(prevState, this.store);
  }

  public produce(producer: (draft: any) => void): void {
    this.update(produce(this.store, producer));
  }

  public merge(payload: Partial<State>): void {
    this.produce((draft: Draft<State>) => Object.assign(draft, payload));
  }

  public set<K extends keyof State>(key: K, value: any): void {
    this.produce((draft: Draft<State[K]>) => {
      draft[key] = value;
    });
  }

  public delete<K extends keyof State>(key: K): void {
    this.produce((draft: Draft<State[K]>) => {
      delete draft[key];
    });
  }

  public keys(): string[] {
    return Object.keys(this.store);
  }
}

export default Store;

import produce, { Draft } from 'immer';

export type State = { readonly [k: string]: any };

class Storage {
  private store: State = {};

  constructor(payload: State = {}) {
    this.store = { ...payload };
  }

  getState(): State {
    return this.store;
  }

  get<K extends keyof State>(key: K): State[K] {
    return this.store[key];
  }

  set<K extends keyof State>(key: K, value: any): void {
    this.produce((draft: Draft<State[K]>) => {
      draft[key] = value;
    });
  }

  produce(producer: (draft: any) => void): void {
    this.update(produce(this.store, producer));
  }

  update(nextState: State): void {
    this.store = nextState;
  }

  merge(payload: Partial<State>): void {
    this.store = {
      ...this.store,
      ...payload,
    };
  }

  delete<K extends keyof State>(key: K): void {
    this.produce((draft: Draft<State[K]>) => {
      delete draft[key];
    });
  }
}

export default Storage;

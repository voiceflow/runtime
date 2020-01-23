/* eslint-disable no-unused-expressions */

import produce, { Draft } from 'immer';

export type State = { readonly [k: string]: any };

type DidUpdate = (prevState: State, state: State) => void;
type WillUpdate = (state: State, nextState: State) => void;

class Store {
  private store: State = {};

  private readonly didUpdate: DidUpdate;

  private readonly willUpdate: WillUpdate;

  static merge(store1: Store, store2: Store): Store {
    return new Store({ ...store1.getState(), ...store2.getState() });
  }

  constructor(payload: State = {}, { didUpdate, willUpdate }: { didUpdate?: DidUpdate; willUpdate?: WillUpdate } = {}) {
    this.store = { ...payload };

    this.didUpdate = didUpdate;
    this.willUpdate = willUpdate;
  }

  // initialize all provided variables
  public initialize(keys: string[], value: any = 0) {
    this.produce((store: Draft<State>) => {
      keys.forEach((key) => {
        if (store[key] === undefined) {
          store[key] = value;
        }
      });
    });
  }

  public getState(): State {
    return this.store;
  }

  public get<K extends keyof State>(key: K): State[K] {
    return this.store[key];
  }

  public has<K extends keyof State>(key: K): boolean {
    // eslint-disable-next-line no-prototype-builtins
    return this.store.hasOwnProperty(key);
  }

  public update(nextState: State): void {
    const prevState = this.store;

    this.willUpdate?.(this.store, nextState);

    this.store = nextState;

    this.didUpdate?.(prevState, this.store);
  }

  public produce(producer: (draft: Draft<State>) => void): void {
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

  public reduce<T>(callback: (acc: T, value: { key: string; value: any }, index: number) => T, initial: T): T {
    return this.keys().reduce((acc, key, i) => callback(acc, { key, value: this.get(key) }, i), initial);
  }

  public map<T>(callback: (value: { key: string; value: any }, index: number) => T): T[] {
    return this.reduce<T[]>((acc, ...args) => [...acc, callback(...args)], []);
  }

  public forEach(callback: (value: { key: string; value: any }, index: number) => void) {
    this.reduce<void[]>((_, ...args) => [callback(...args)], []);
  }

  public flush(): void {
    this.update({});
  }
}

export default Store;

import _produce, { Draft } from 'immer';

class Storage <S extends {readonly [K in keyof S]: S[K]}> {
  private store: S = {} as S;

  initialize(payload: S = {} as S): void {
    this.store = { ...payload };
  }

  constructor(payload: S = {} as S) {
    this.initialize(payload);
  }

  getState(): S {
    return this.store;
  }

  get<K extends keyof S>(key: K): S[K] {
    return this.store[key];
  }

  produce(producer: (draft: any) => void): void {
    this.store = _produce(this.store, producer);
  }

  update<K extends keyof S>(key: K, value: any): void {
    this.produce((draft: Draft<S[K]>) => {
      draft[key] = value;
    });
  };

  merge(payload: Partial<S>): void {
    this.store = {
      ...this.store,
      ...payload,
    }
  }

  delete<K extends keyof S>(key: K): void {
    this.produce((draft: Draft<S[K]>) => {
      delete draft[key];
    });
  }
};

export default Storage;
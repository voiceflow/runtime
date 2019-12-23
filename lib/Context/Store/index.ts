import _produce, { Draft } from 'immer';

class Storage {
  private store: object = {};

  initialize(payload: object): void {
    this.store = {...payload};
  }

  constructor(payload?: object) {
    this.initialize(payload);
  }

  getState(): object {
    return this.store;
  }

  get(key: string): any {
    return this.store[key];
  }

  produce(producer: (draft: Draft<object>) => void): void {
    this.store = _produce(this.store, producer);
  }

  update(key: string, value: any): void {
    this.produce((draft: Draft<object>) => {
      draft[key] = value;
    });
  };

  merge(payload: object): void {
    this.store = {
      ...this.store,
      ...payload,
    }
  }

  delete(key: string): void {
    this.produce((draft: Draft<object>) => {
      delete draft[key];
    });
  }
};

export default Storage;
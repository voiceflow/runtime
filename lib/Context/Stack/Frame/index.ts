import Store from '../../Store';

export interface FrameState<T, V, S> {
  diagramID: string,
  lineID: string,
  triggers: T[],
  variables: V,
  storage: S,
}

class Frame<T, V, S> {
  diagramID: string;
  lineID: string;
  triggers: T[] = [];
  storage: Store<S>;
  variables: Store<V>;

  getState(): FrameState<T, V, S> {
    return {
      diagramID: this.diagramID,
      lineID: this.lineID,
      triggers: this.triggers,
      storage: this.storage.getState(),
      variables: this.variables.getState(),
    }
  }

  constructor(frameState?: FrameState<T, V, S>) {
    this.variables = new Store(frameState.variables);
    this.storage = new Store(frameState.storage);
    this.diagramID = frameState.diagramID;
    this.lineID = frameState.lineID;
  }
}

export default Frame;

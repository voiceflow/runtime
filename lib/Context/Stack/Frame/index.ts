import Store, { State as StoreState } from '../../Store';

export interface State {
  lineID?: string;
  diagramID: string;

  storage: StoreState;
  triggers: { [key: string]: any }[];
  variables: StoreState;
}

class Frame {
  lineID: string;
  diagramID: string;

  storage: Store;
  triggers: { [key: string]: any }[] = [];
  variables: Store;

  constructor(frameState?: State) {
    this.lineID = frameState.lineID ?? null;
    this.diagramID = frameState.diagramID;

    this.storage = new Store(frameState.storage);
    this.triggers = frameState.triggers;
    this.variables = new Store(frameState.variables);
  }

  public getState(): State {
    return {
      lineID: this.lineID,
      diagramID: this.diagramID,

      storage: this.storage.getState(),
      triggers: this.triggers,
      variables: this.variables.getState(),
    };
  }
}

export default Frame;

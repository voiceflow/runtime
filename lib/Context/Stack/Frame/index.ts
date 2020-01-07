import Store, { State as StoreState } from '../../Store';

export interface State {
  blockID?: string;
  diagramID: string;

  storage: StoreState;
  triggers: { [key: string]: any }[];
  variables: StoreState;
}

class Frame {
  blockID: string = null;
  diagramID: string;

  storage: Store;
  triggers: { [key: string]: any }[] = [];
  variables: Store;

  constructor(frameState?: State) {
    this.blockID = frameState.blockID ?? null;
    this.diagramID = frameState.diagramID;

    this.storage = new Store(frameState.storage);
    this.triggers = frameState.triggers;
    this.variables = new Store(frameState.variables);
  }

  public getState(): State {
    return {
      blockID: this.blockID,
      diagramID: this.diagramID,

      storage: this.storage.getState(),
      triggers: this.triggers,
      variables: this.variables.getState(),
    };
  }

  public getBlockID(): string {
    return this.blockID;
  }

  public setBlockID(blockID: string): void {
    this.blockID = blockID;
  }
}

export default Frame;

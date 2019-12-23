import Store from '../../Store';

export interface FrameState {
  diagramID: string,
  lineID: string,
  triggers: object[],
  variables: object,
  storage: object,
}

class Frame {
  diagramID: string;
  lineID: string;
  triggers: object[] = [];
  storage: Store;
  variables: Store;

  getState(): FrameState {
    return {
      diagramID: this.diagramID,
      lineID: this.lineID,
      triggers: this.triggers,
      storage: this.storage.getState(),
      variables: this.variables.getState(),
    }
  }

  constructor(frameState?: FrameState) {
    this.variables = new Store(frameState.variables);
    this.storage = new Store(frameState.storage);
    this.diagramID = frameState.diagramID;
    this.lineID = frameState.lineID;
  }
}

export default Frame;

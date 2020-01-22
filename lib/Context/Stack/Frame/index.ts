import Store, { State as StoreState } from '../../Store';
import { initializeVariables } from '../../utils/variables';
import Diagram from '@/lib/Diagram';

export interface State {
  blockID?: string;
  diagramID: string;

  storage?: StoreState;
  requests?: object;
  variables?: StoreState;
}

class Frame {
  private updated: boolean = false;

  private blockID?: string = null;
  private startBlockID: string = null;
  private diagramID: string;
  private requests: object = {};

  public storage: Store;
  public variables: Store;

  constructor(frameState?: State) {
    this.blockID = frameState.blockID ?? null;
    this.diagramID = frameState.diagramID;

    this.storage = new Store(frameState.storage);
    this.requests = frameState.requests;
    this.variables = new Store(frameState.variables);
  }

  public getState(): State {
    return {
      blockID: this.blockID,
      diagramID: this.diagramID,

      storage: this.storage.getState(),
      requests: this.requests,
      variables: this.variables.getState(),
    };
  }

  public update(diagram: Diagram): void {
    if (this.updated) {
      return;
    }

    this.updated = true;

    this.requests = diagram.getRequests();
    this.startBlockID = diagram.getStartBlockID();

    initializeVariables(this.variables, diagram.getVariables(), 0);

    if (!this.blockID) {
      this.blockID = this.startBlockID;
    }
  }

  public getBlockID(): string {
    return this.blockID;
  }

  public setBlockID(blockID?: string): void {
    this.blockID = blockID;
  }

  public getDiagramID(): string {
    return this.diagramID;
  }

  public setDiagramID(diagramID: string): void {
    this.diagramID = diagramID;
  }

  public getRequests(): object {
    return this.requests;
  }
}

export default Frame;

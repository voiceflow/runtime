import Diagram, { Command } from '@/lib/Diagram';

import Store, { State as StoreState } from '../../Store';

export interface State {
  blockID: string | null;
  diagramID: string;

  storage: StoreState;
  commands?: Command[];
  variables: StoreState;
}

export interface Options {
  blockID?: string | null;
  diagramID: string;

  storage?: StoreState;
  commands?: Command[];
  variables?: StoreState;
}

class Frame {
  private updated = false;

  private blockID: string | null = null;

  private startBlockID: string | null = null;

  private diagramID: string;

  private commands: Command[] = [];

  public storage: Store;

  public variables: Store;

  constructor(frameState: Options) {
    this.blockID = frameState.blockID ?? null;
    this.diagramID = frameState.diagramID;

    this.storage = new Store(frameState.storage);
    this.commands = frameState.commands ?? [];
    this.variables = new Store(frameState.variables);
  }

  public getState(): State {
    return {
      blockID: this.blockID,
      diagramID: this.diagramID,

      storage: this.storage.getState(),
      commands: this.commands,
      variables: this.variables.getState(),
    };
  }

  public update(diagram: Diagram): void {
    if (this.updated) {
      return;
    }

    this.updated = true;

    this.commands = diagram.getCommands();
    this.startBlockID = diagram.getStartBlockID();

    Store.initialize(this.variables, diagram.getVariables(), 0);

    if (!this.blockID) {
      this.blockID = this.startBlockID;
    }
  }

  public getBlockID(): string | null {
    return this.blockID;
  }

  public setBlockID(blockID: string | null): void {
    this.blockID = blockID;
  }

  public getDiagramID(): string {
    return this.diagramID;
  }

  public setDiagramID(diagramID: string): void {
    this.diagramID = diagramID;
  }

  public getCommands(): Command[] {
    return this.commands;
  }
}

export default Frame;

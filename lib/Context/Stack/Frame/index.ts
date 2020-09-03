import { Command } from '@voiceflow/api-sdk';

import ProgramModel from '@/lib/Program';

import Store, { State as StoreState } from '../../Store';

export interface State {
  nodeID?: string | null;
  programID: string;

  storage: StoreState;
  commands?: Command[];
  variables: StoreState;
}

export interface Options {
  nodeID?: string | null;
  programID: string;

  storage?: StoreState;
  commands?: Command[];
  variables?: StoreState;

  // deprecated
  blockID?: string | null;
  diagramID?: string;
}

class Frame {
  private initialized = false;

  private nodeID?: string | null;

  private startNodeID: string | null = null;

  private programID: string;

  private commands: Command[] = [];

  public storage: Store;

  public variables: Store;

  constructor(frameState: Options) {
    this.nodeID = frameState.nodeID ?? frameState.blockID;
    this.programID = frameState.programID ?? frameState.diagramID;

    this.storage = new Store(frameState.storage);
    this.commands = frameState.commands ?? [];
    this.variables = new Store(frameState.variables);
  }

  public getState(): State {
    return {
      nodeID: this.nodeID,
      programID: this.programID,

      storage: this.storage.getState(),
      commands: this.commands,
      variables: this.variables.getState(),
    };
  }

  public initialize(program: ProgramModel): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    this.commands = program.getCommands();
    this.startNodeID = program.getStartNodeID();

    Store.initialize(this.variables, program.getVariables(), 0);

    if (this.nodeID === undefined) {
      this.nodeID = this.startNodeID;
    }
  }

  public getNodeID(): string | null | undefined {
    return this.nodeID;
  }

  public setNodeID(nodeID: string | null): void {
    this.nodeID = nodeID;
  }

  public getProgramID(): string {
    return this.programID;
  }

  public setProgramID(programID: string): void {
    this.programID = programID;
  }

  public getCommands(): Command[] {
    return this.commands;
  }
}

export default Frame;

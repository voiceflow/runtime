export interface DiagramBody {
  blocks: object;
  commands?: object[];
  startBlockID: string;
  variables?: string[];
}

class Diagram {
  private blocks: object;
  private commands: object[] = [];
  private variables: string[] = [];
  private startBlockID: string = null;

  constructor({ blocks, variables, commands, startBlockID }: DiagramBody) {
    this.blocks = blocks;
    this.commands = commands;
    this.variables = variables;
    this.startBlockID = startBlockID;
  }

  public getBlock(blockID: string): object {
    return {
      ...this.blocks[blockID],
      blockID,
    };
  }

  public getCommands(): object[] {
    return this.commands;
  }

  public getStartBlockID(): string {
    return this.startBlockID;
  }

  public getVariables(): string[] {
    return this.variables;
  }

  public getRaw() {
    return this.blocks;
  }
}

export default Diagram;

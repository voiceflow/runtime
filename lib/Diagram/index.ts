export interface DiagramBody {
  blocks: object;
  requests?: object;
  startBlockID: string;
  variables?: string[];
}

class Diagram {
  private blocks: object;
  private requests: object = {};
  private variables: string[] = [];
  private startBlockID: string = null;

  constructor({ blocks, variables, requests, startBlockID }: DiagramBody) {
    this.blocks = blocks;
    this.requests = requests;
    this.variables = variables;
    this.startBlockID = startBlockID;
  }

  public getBlock(blockID: string): object {
    return {
      ...this.blocks[blockID],
      blockID,
    };
  }

  public getRequests(): object {
    return this.requests;
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

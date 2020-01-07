export interface DiagramBody {
  blocks: object,
  requests?: object,
  startBlockID: string,
  variables?: string[],
}

class Diagram {
  private blocks: object;
  private requests: object = {};
  private variables: string[] = [];
  private startBlockID: string = null;

  constructor(diagram: DiagramBody) {
    this.blocks = diagram.blocks;
    this.variables = diagram.variables;
    this.requests = diagram.requests;
    this.startBlockID = diagram.startBlockID;
  }

  getBlock(blockID: string): object {
    return {
      ...this.blocks[blockID],
      blockID,
    };
  }

  getRequests(): object {
    return this.requests;
  }

  getStartBlockID(): string {
    return this.startBlockID;
  }

  getVariables(): string[] {
    return this.variables;
  }

  getRaw() {
    return this.blocks;
  }
}

export default Diagram;
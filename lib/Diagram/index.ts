export type RawBlock<B> = B & {
  [key: string]: any;
};

export type Block<T extends {} = {}> = T & {
  nextId?: string;
  blockID: string;
};

export interface DiagramBody<B> {
  blocks: Record<string, RawBlock<B>>;
  requests?: object;
  variables?: string[];
  startBlockID: string;
}

class Diagram<B> {
  private blocks: Record<string, RawBlock<B>>;
  private requests: object = {};
  private variables: string[] = [];
  private startBlockID: string;

  constructor({ blocks, variables, requests, startBlockID }: DiagramBody<B>) {
    this.blocks = blocks;
    this.requests = requests ?? {};
    this.variables = variables ?? [];
    this.startBlockID = startBlockID;
  }

  public getBlock(blockID: string | null): Block<B> | null {
    if (!blockID || !this.blocks[blockID]) {
      return null;
    }

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

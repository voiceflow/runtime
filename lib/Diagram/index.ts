export type RawBlock<B> = B & {
  [key: string]: any;
};

export type Block<T extends {} = {}> = T & {
  nextId?: string;
  blockID: string;
};

export type Command = { [key: string]: any };

export interface DiagramBody<B> {
  id: string;
  blocks: Record<string, RawBlock<B>>;
  commands?: Command[];
  variables?: string[];
  startBlockID: string;
}

class Diagram<B> {
  private id: string;

  private blocks: Record<string, RawBlock<B>>;

  private commands: Command[] = [];

  private variables: string[] = [];

  private startBlockID: string;

  constructor({ id, blocks, variables = [], commands = [], startBlockID }: DiagramBody<B>) {
    this.id = id;
    this.blocks = blocks;
    this.commands = commands;
    this.variables = variables;
    this.startBlockID = startBlockID;
  }

  public getID(): string {
    return this.id;
  }

  public getBlock(blockID: string | null): Block<B> | null {
    // eslint-disable-next-line no-prototype-builtins
    if (!(blockID && this.blocks.hasOwnProperty(blockID))) {
      return null;
    }

    return {
      ...this.blocks[blockID],
      blockID,
    };
  }

  public getCommands(): Command[] {
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

class Diagram {
  private diagram: object;

  constructor(diagram: object) {
    this.diagram = diagram;
  }

  getBlock(blockID: string): object {
    return this.diagram[blockID];
  }

  getRaw() {
    return this.diagram;
  }
}

export default Diagram;
import { expect } from 'chai';

import Diagram from '@/lib/Diagram';

describe('Diagram unit tests', () => {
  describe('constructor', () => {
    it('default values', () => {
      const diagram = new Diagram({ id: 'id', blocks: 'blocks' as any, startBlockID: 'start' });
      expect(diagram.getVariables()).to.eql([]);
      expect(diagram.getCommands()).to.eql([]);
    });

    it('correct attributes init', () => {
      const id = 'id';
      const blocks = 'blocks';
      const variables = 'variables';
      const commands = 'commands';
      const startBlockID = 'start-id';
      const diagram = new Diagram({ id, blocks: blocks as any, variables: variables as any, commands: commands as any, startBlockID });
      expect(diagram.getID()).to.eql(id);
      expect(diagram.getRaw()).to.eql(blocks);
      expect(diagram.getVariables()).to.eql(variables);
      expect(diagram.getCommands()).to.eql(commands);
      expect(diagram.getStartBlockID()).to.eql(startBlockID);
    });
  });

  describe('getBlock', () => {
    it('no blockID', () => {
      const diagram = new Diagram({ id: 'id', blocks: null as any, startBlockID: 'start' });
      expect(diagram.getBlock(null)).to.eql(null);
    });

    it('block not found', () => {
      const blocks = {
        1: { one: '1' },
        2: { two: '2' },
      };
      const diagram = new Diagram({ id: 'id', blocks: blocks as any, startBlockID: 'start' });
      const blockID = 'random';
      expect(diagram.getBlock(blockID)).to.eql(null);
    });

    it('returns block correctly', () => {
      const blocks = {
        1: { one: '1' },
        2: { two: '2' },
        3: { three: '3' },
      };
      const diagram = new Diagram({ id: 'id', blocks: blocks as any, startBlockID: 'start' });
      const blockID = '2';
      expect(diagram.getBlock(blockID)).to.eql({ ...blocks[blockID], blockID });
    });
  });
});

import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import Frame from '@/lib/Context/Stack/Frame/index';

describe('Context Stack Frame unit tests', () => {
  it('getState', () => {
    const options = {
      blockID: 'block-id',
      diagramID: 'diagram-id',
      storage: { s1: 'v1' },
      commands: [{}, {}],
      variables: { v1: 'v1' },
    };
    const frame = new Frame(options);
    expect(frame.getState()).to.eql({
      blockID: options.blockID,
      diagramID: options.diagramID,
      storage: options.storage,
      commands: options.commands,
      variables: options.variables,
    });
  });

  it('getBlockID', () => {
    const blockID = 'block-id';
    const frame = new Frame({ blockID } as any);
    expect(frame.getBlockID()).to.eql(blockID);
  });

  it('setBlockID', () => {
    const blockID = 'block-id';
    const frame = new Frame({} as any);
    frame.setBlockID(blockID);
    expect(_.get(frame, 'blockID')).to.eql(blockID);
  });

  it('getDiagramID', () => {
    const diagramID = 'diagram-id';
    const frame = new Frame({ diagramID } as any);
    expect(frame.getDiagramID()).to.eql(diagramID);
  });

  it('setDiagramID', () => {
    const diagramID = 'diagram-id';
    const frame = new Frame({} as any);
    frame.setDiagramID(diagramID);
    expect(_.get(frame, 'diagramID')).to.eql(diagramID);
  });

  it('getCommands', () => {
    const commands = [{ c1: 'v1' }, { c2: 'v2' }];
    const frame = new Frame({ commands } as any);
    expect(frame.getCommands()).to.eql(commands);
  });

  describe('initialize', () => {
    it('already initialized', () => {
      const frame = new Frame({} as any);
      _.set(frame, 'initialized', true);
      frame.initialize(null as any);
      expect(frame.getBlockID()).to.eql(undefined);
    });

    it('init blockID', () => {
      const frame = new Frame({} as any);
      const commands = [{ c1: 'v1' }, { c2: 'v2' }];
      const startBlockID = 'start-block-id';
      const variables = ['var1', 'var2'];
      const diagram = {
        getCommands: sinon.stub().returns(commands),
        getStartBlockID: sinon.stub().returns(startBlockID),
        getVariables: sinon.stub().returns(variables),
      };

      frame.initialize(diagram as any);

      expect(frame.getBlockID()).to.eql(startBlockID);
      expect(frame.getCommands()).to.eql(commands);
      expect(frame.getState().variables).to.eql({ var1: 0, var2: 0 });
    });

    it('blockID already set', () => {
      const blockID = 'block-id';
      const frame = new Frame({ blockID } as any);
      const startBlockID = 'start-block-id';
      const diagram = {
        getCommands: sinon.stub().returns([]),
        getStartBlockID: sinon.stub().returns(startBlockID),
        getVariables: sinon.stub().returns([]),
      };

      frame.initialize(diagram as any);

      expect(frame.getBlockID()).to.eql(blockID);
      expect(_.get(frame, 'startBlockID')).to.eql(startBlockID);
    });
  });
});

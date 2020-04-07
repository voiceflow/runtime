import { expect } from 'chai';
import sinon from 'sinon';

import { S } from '@/lib/Constants';
import * as Frame from '@/lib/Context/Stack/Frame';
import * as Utils from '@/lib/Context/utils/variables';
import FlowHandler from '@/lib/Handler/flow';

describe('FlowHandler unit tests', () => {
  describe('canHandle', () => {
    it('false', () => {
      expect(FlowHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(FlowHandler.canHandle({ diagram_id: 'diagram-id' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('no variable_map', () => {
      // stubs
      const mapStoresStub = sinon.stub(Utils, 'mapStores');
      const frameStub = sinon.stub(Frame, 'default');
      const newFrame = { storage: { set: sinon.stub() }, getDiagramID: sinon.stub().returns('diagram-id-from-frame'), variables: 'frame-variables' };
      frameStub.returns(newFrame);

      const block = { blockID: 'block-id', diagram_id: 'diagram-id', nextId: 'next-id' };
      const topFrame = { setBlockID: sinon.stub() };
      const context = { stack: { top: sinon.stub().returns(topFrame), push: sinon.stub() }, trace: { debug: sinon.stub() } };
      const variables = {};

      // assertions
      expect(FlowHandler.handle(block, context as any, variables as any, null as any)).to.eql(null);
      expect(frameStub.calledWithNew()).to.eql(true);
      expect(frameStub.args).to.eql([[{ diagramID: block.diagram_id }]]);
      expect(mapStoresStub.args).to.eql([[[], variables, newFrame.variables]]);
      expect(newFrame.storage.set.args).to.eql([[S.OUTPUT_MAP, undefined]]);
      expect(topFrame.setBlockID.args).to.eql([[block.nextId]]);
      expect(context.stack.push.args).to.eql([[newFrame]]);
      expect(context.trace.debug.args).to.eql([[`entering flow \`${newFrame.getDiagramID()}\``]]);
    });

    it('with variable_map', () => {
      // stubs
      const mapStoresStub = sinon.stub(Utils, 'mapStores');
      const frameStub = sinon.stub(Frame, 'default');
      const newFrame = { storage: { set: sinon.stub() }, getDiagramID: sinon.stub().returns('diagram-id-from-frame'), variables: 'frame-variables' };
      frameStub.returns(newFrame);

      const block = {
        blockID: 'block-id',
        diagram_id: 'diagram-id',
        variable_map: {
          inputs: [
            ['a', 'b'],
            ['c', 'd'],
          ] as [string, string][],
          outputs: [
            ['e', 'f'],
            ['g', 'h'],
          ] as [string, string][],
        },
      };
      const topFrame = { setBlockID: sinon.stub() };
      const context = { stack: { top: sinon.stub().returns(topFrame), push: sinon.stub() }, trace: { debug: sinon.stub() } };
      const variables = {};

      // assertions
      expect(FlowHandler.handle(block, context as any, variables as any, null as any)).to.eql(null);
      expect(frameStub.calledWithNew()).to.eql(true);
      expect(frameStub.args).to.eql([[{ diagramID: block.diagram_id }]]);
      expect(mapStoresStub.args).to.eql([[block.variable_map.inputs, variables, newFrame.variables]]);
      expect(newFrame.storage.set.args).to.eql([[S.OUTPUT_MAP, block.variable_map.outputs]]);
      expect(topFrame.setBlockID.args).to.eql([[null]]);
      expect(context.stack.push.args).to.eql([[newFrame]]);
      expect(context.trace.debug.args).to.eql([[`entering flow \`${newFrame.getDiagramID()}\``]]);
    });
  });
});

import { expect } from 'chai';
import sinon from 'sinon';

import * as cycleHandler from '@/lib/Context/cycleHandler';
import cycleStack from '@/lib/Context/cycleStack';
import * as utils from '@/lib/Context/utils/variables';
import { EventType } from '@/lib/Lifecycle';

describe('Context cycleStack unit tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('stack is empty', () => {
    const context = { stack: { getSize: sinon.stub().returns(0) }, end: sinon.stub() };
    cycleStack(context as any);
    expect(context.end.callCount).to.eql(1);
  });

  it('depth is above limit', () => {
    const context = { stack: { getSize: sinon.stub().returns(1) }, end: sinon.stub() };
    cycleStack(context as any, 61);
    expect(context.end.callCount).to.eql(1);
  });

  it('error exe where context ended', async () => {
    const newError = new Error('error');
    sinon.stub(cycleHandler, 'default').throws(newError);
    sinon.stub(utils, 'createCombinedVariables').returns({} as any);
    sinon.stub(utils, 'saveCombinedVariables');

    const context = {
      callEvent: sinon.stub(),
      stack: {
        getSize: sinon.stub().returns(1),
        top: sinon
          .stub()
          .returns({ getDiagramID: sinon.stub().returns('diagram-id'), initialize: sinon.stub(), variables: { var1: 'val1', var2: 'val2' } }),
        getFrames: sinon.stub().returns({}),
      },
      hasEnded: sinon.stub().returns(true),
      getDiagram: sinon.stub().returns({}),
      variables: 'context-variables',
    };

    await cycleStack(context as any);

    expect(context.callEvent.args[1]).to.eql([EventType.stateDidCatch, { error: newError }]);
  });

  describe('normal exe', () => {
    it('context ended', async () => {
      const cycleHandlerStub = sinon.stub(cycleHandler, 'default');
      const combinedVariables = {};
      const createCombinedVariablesStub = sinon.stub(utils, 'createCombinedVariables').returns(combinedVariables as any);
      const saveCombinedVariablesStub = sinon.stub(utils, 'saveCombinedVariables');

      const diagramID = 'diagram-id';
      const currentFrame = { getDiagramID: sinon.stub().returns(diagramID), initialize: sinon.stub(), variables: { var1: 'val1', var2: 'val2' } };
      const currentFrames = {};
      const diagram = {};

      const context = {
        callEvent: sinon.stub(),
        stack: { getSize: sinon.stub().returns(1), top: sinon.stub().returns(currentFrame), getFrames: sinon.stub().returns(currentFrames) },
        hasEnded: sinon.stub().returns(true),
        getDiagram: sinon.stub().returns(diagram),
        variables: 'context-variables',
      };

      await cycleStack(context as any);

      expect(context.getDiagram.args).to.eql([[diagramID]]);
      expect(currentFrame.initialize.args).to.eql([[diagram]]);
      expect(createCombinedVariablesStub.args).to.eql([[context.variables, currentFrame.variables]]);
      expect(context.callEvent.args).to.eql([
        [EventType.stateWillExecute, { diagram, variables: combinedVariables }],
        [EventType.stateDidExecute, { diagram, variables: combinedVariables }],
      ]);
      expect(cycleHandlerStub.args).to.eql([[context, diagram, combinedVariables]]);
      expect(saveCombinedVariablesStub.args).to.eql([[combinedVariables, context.variables, currentFrame.variables]]);
    });

    it('stack is not the same after', async () => {
      sinon.stub(cycleHandler, 'default');
      sinon.stub(utils, 'createCombinedVariables').returns({} as any);
      sinon.stub(utils, 'saveCombinedVariables');

      const context = {
        callEvent: sinon.stub(),
        stack: {
          getSize: sinon
            .stub()
            .onFirstCall()
            .returns(1)
            .onSecondCall()
            .returns(0),
          top: sinon
            .stub()
            .returns({ getDiagramID: sinon.stub().returns('diagram-id'), initialize: sinon.stub(), variables: { var1: 'val1', var2: 'val2' } }),
          getFrames: sinon
            .stub()
            .onFirstCall()
            .returns([{}])
            .onSecondCall()
            .returns([]),
        },
        end: sinon.stub(),
        hasEnded: sinon.stub().returns(false),
        getDiagram: sinon.stub().returns({}),
        variables: 'context-variables',
      };

      await cycleStack(context as any);

      // assert cycleStack recursion, on second iteration cycleStack calls context.end
      expect(context.end.callCount).to.eql(1);
    });

    describe('stack is the same', () => {
      it('no poppedFrame', async () => {
        sinon.stub(cycleHandler, 'default');
        sinon.stub(utils, 'createCombinedVariables').returns({} as any);
        sinon.stub(utils, 'saveCombinedVariables');

        const context = {
          callEvent: sinon.stub(),
          stack: {
            pop: sinon.stub().returns(null),
            getSize: sinon
              .stub()
              .onFirstCall()
              .returns(1)
              .onSecondCall()
              .returns(0),
            top: sinon
              .stub()
              .returns({ getDiagramID: sinon.stub().returns('diagram-id'), initialize: sinon.stub(), variables: { var1: 'val1', var2: 'val2' } }),
            getFrames: sinon.stub().returns([]),
          },
          end: sinon.stub(),
          hasEnded: sinon.stub().returns(false),
          getDiagram: sinon.stub().returns({}),
          variables: 'context-variables',
        };

        await cycleStack(context as any);

        expect(context.callEvent.callCount).to.eql(3);
        expect(context.callEvent.args[2]).to.eql([EventType.frameDidFinish, { frame: null }]);
      });

      it('with poppedFrame', async () => {
        sinon.stub(cycleHandler, 'default');
        const combinedVariables = { foo: 'bar' };
        sinon.stub(utils, 'createCombinedVariables').returns(combinedVariables as any);
        sinon.stub(utils, 'saveCombinedVariables');
        const mapStoresStub = sinon.stub(utils, 'mapStores');

        const OUTPUT_MAP = 'output-map';
        const topFrameVariables = { var1: 'val1', var2: 'val2' };
        const context = {
          callEvent: sinon.stub(),
          stack: {
            pop: sinon.stub().returns({ storage: { get: sinon.stub().returns(OUTPUT_MAP) } }),
            getSize: sinon
              .stub()
              .onFirstCall()
              .returns(1)
              .onSecondCall()
              .returns(0),
            top: sinon.stub().returns({ getDiagramID: sinon.stub().returns('diagram-id'), initialize: sinon.stub(), variables: topFrameVariables }),
            getFrames: sinon.stub().returns([]),
          },
          end: sinon.stub(),
          hasEnded: sinon.stub().returns(false),
          getDiagram: sinon.stub().returns({}),
          variables: 'context-variables',
        };

        await cycleStack(context as any);
        expect(mapStoresStub.args).to.eql([[OUTPUT_MAP, combinedVariables, topFrameVariables]]);
      });
    });
  });
});

import { expect } from 'chai';
import sinon from 'sinon';

import EndHandler from '@/lib/Handlers/end';

describe('EndHandler unit tests', () => {
  const endHandler = EndHandler();

  describe('canHandle', () => {
    it('false', () => {
      expect(endHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(endHandler.canHandle({ end: true } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('works correctly', () => {
      const frame = {
        getNodeID: sinon.stub().returns(null),
        setNodeID: sinon.stub()
      }
      const context = {
        stack: { pop: sinon.stub(), top: sinon.stub().returns(frame), isEmpty: sinon.stub().onFirstCall().returns(false).onSecondCall().returns(true) },
        turn: { set: sinon.stub() },
        end: sinon.stub(),
        trace: { debug: sinon.stub(), addTrace: sinon.stub() },
      };
      expect(endHandler.handle(null as any, context as any, null as any, null as any)).to.eql(null);
      expect(context.stack.pop.callCount).to.eql(1);
      expect(frame.setNodeID.args).to.eql([[null]]);
      expect(frame.getNodeID.callCount).to.eql(2);
      expect(context.stack.top.callCount).to.eql(3);
      expect(context.stack.isEmpty.callCount).to.eql(2);
      expect(context.turn.set.args).to.eql([['end', true]]);
      expect(context.end.callCount).to.eql(1);
      expect(context.trace.debug.args).to.eql([['exiting session - saving location/resolving stack']]);
    });
  });
});

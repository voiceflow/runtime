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
      const context = {
        stack: { pop: sinon.stub() },
        turn: { set: sinon.stub() },
        end: sinon.stub(),
        trace: { debug: sinon.stub() },
      };
      expect(endHandler.handle(null as any, context as any, null as any, null as any)).to.eql(null);
      expect(context.stack.pop.callCount).to.eql(1);
      expect(context.turn.set.args).to.eql([['end', true]]);
      expect(context.end.callCount).to.eql(1);
      expect(context.trace.debug.args).to.eql([['exiting session - saving location/resolving stack']]);
    });
  });
});
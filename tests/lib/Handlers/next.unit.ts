import { expect } from 'chai';
import sinon from 'sinon';

import NextHandler from '@/lib/Handlers/next';

describe('EndHandler unit tests', () => {
  const nextHandler = NextHandler();

  describe('canHandle', () => {
    it('false', () => {
      expect(nextHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(nextHandler.canHandle({ nextId: 'next-id' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('returns nextId', () => {
      const nextId = 'next-id';
      const context = {
        trace: { debug: sinon.stub() },
      };
      expect(nextHandler.handle({ nextId } as any, context as any, null as any, null as any)).to.eql(nextId);
      expect(context.trace.debug.args).to.eql([['could not handle step - redirecting to the next step']]);
    });

    it('returns null', () => {
      const context = {
        trace: { debug: sinon.stub() },
      };
      expect(nextHandler.handle({} as any, context as any, null as any, null as any)).to.eql(null);
      expect(context.trace.debug.args).to.eql([['could not handle step - redirecting to the next step']]);
    });
  });
});